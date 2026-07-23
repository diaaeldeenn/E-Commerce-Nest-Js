import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import CartRepository from '../../DB/repository/cart.repository';
import CouponRepository from '../../DB/repository/coupon.repository';
import OrderRepository from '../../DB/repository/order.repository';
import ProductRepository from '../../DB/repository/product.repository';
import { CouponService } from '../coupon/coupon.service';
import { CreateCashOrderDto, PaginationDto } from './order.dto';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../common/enum/order.enum';
import { StripeService } from '../../common/service/stripe.service';
import Stripe from 'stripe';
import { RoleEnum } from '../../common/enum/user.enum';

@Injectable()
export class OrderService {
  private async getCart(cartId: string, userId: Types.ObjectId) {
    const cart = await this.cartModel.findOne({
      filter: {
        _id: Types.ObjectId.createFromHexString(cartId),
        createdBy: userId,
        deletedAt: { $exists: false },
        isOrdered: false,
      },
      options: {
        populate: {
          path: 'products.productId',
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart Not Found Or Not Authorized');
    }

    return cart;
  }

  constructor(
    private readonly orderModel: OrderRepository,
    private readonly cartModel: CartRepository,
    private readonly productModel: ProductRepository,
    private readonly couponService: CouponService,
    private readonly stripeService: StripeService,
    private readonly couponModel: CouponRepository,
  ) {}

  async createCashOrder(body: CreateCashOrderDto, user: any) {
    const { cartId, address, phone, couponCode } = body;

    const cart = await this.getCart(cartId, user._id);

    if (!cart.products || cart.products.length === 0) {
      throw new BadRequestException('Cart Is Empty');
    }

    let coupon: any = null;
    let totalPrice = cart.subTotal;

    if (couponCode) {
      coupon = await this.couponService.validateCoupon(
        couponCode,
        user._id,
        cart.subTotal,
      );

      const discountValue = (cart.subTotal * coupon.amount) / 100;
      totalPrice = cart.subTotal - discountValue;
    }

    for (const item of cart.products) {
      const product: any = item.productId;
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(
          `Product "${product?.title || 'Item'}" Is Out Of Stock Or Not Available`,
        );
      }
    }

    const orderProducts = cart.products.map((item: any) => {
      const product = item.productId;
      return {
        productId: product._id,
        title: product.title,
        price: item.finalPrice,
        quantity: item.quantity,
      };
    });

    const order = await this.orderModel.create({
      userId: user._id,
      cart: cart._id,
      coupon: coupon ? coupon._id : undefined,
      totalPrice,
      phone,
      address,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.UNPAID,
      products: orderProducts,
    });

    await this.cartModel.findOneAndUpdate({
      filter: { _id: cart._id },
      update: { isOrdered: true },
    });

    for (const item of cart.products) {
      const product: any = item.productId;

      const updatedProduct = await this.productModel.findOneAndUpdate({
        filter: {
          _id: product._id,
          stock: { $gte: item.quantity },
        },
        update: {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity,
          },
        },
      });

      if (!updatedProduct) {
        throw new BadRequestException(
          `Product "${product?.title || 'Item'}" Is Out Of Stock During Processing`,
        );
      }
    }

    if (coupon) {
      await this.couponModel.findOneAndUpdate({
        filter: { _id: coupon._id },
        update: {
          $addToSet: { usedBy: user._id },
        },
      });
    }

    return {
      message: 'Order Created Successfully',
      order,
    };
  }

  async createCardOrder(id: Types.ObjectId, user: any) {
    const order = await this.orderModel.findOne({
      filter: {
        _id: id,
        userId: user._id,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    if (!order) {
      throw new NotFoundException('Order Not Found Or Already Paid');
    }

    const session = await this.stripeService.createCheckoutSession({
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      line_items: order.products.map((product: any) => {
        return {
          price_data: {
            currency: 'egp',
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
    });

    return session;
  }

  async webhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(rawBody, signature);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata!.orderId;
      const paymentIntent = session.payment_intent;

      const order = await this.orderModel.findOneAndUpdate({
        filter: {
          _id: orderId,
          paymentStatus: PaymentStatus.UNPAID,
        },
        update: {
          paymentStatus: PaymentStatus.PAID,
          paymentIntent: paymentIntent as string,
          orderChanges: {
            paidAt: new Date(),
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return { received: true, order };
    }

    return { received: true };
  }

  async refundOrderPayment(id: Types.ObjectId, user: any) {
    const order = await this.orderModel.findOne({
      filter: {
        _id: id,
        userId: user._id,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.PAID,
        status: {
          $nin: [OrderStatus.SHIPPED, OrderStatus.DELIVERED],
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order Not Found Or Cannot Be Refunded');
    }

    if (!order.paymentIntent) {
      throw new BadRequestException('Payment Intent Not Found');
    }

    const refund = await this.stripeService.createRefundPayment(
      order.paymentIntent,
    );

    if (refund.status !== 'succeeded') {
      throw new BadRequestException('Refund failed');
    }

    for (const item of order.products) {
      await this.productModel.findOneAndUpdate({
        filter: {
          _id: item.productId,
        },
        update: {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
      });
    }

    if (order.coupon) {
      await this.couponModel.findOneAndUpdate({
        filter: {
          _id: order.coupon,
        },
        update: {
          $pull: {
            usedBy: user._id,
          },
        },
      });
    }

    await this.cartModel.findOneAndUpdate({
      filter: {
        _id: order.cart,
      },
      update: {
        isOrdered: false,
      },
    });

    const updatedOrder = await this.orderModel.findOneAndUpdate({
      filter: {
        _id: order._id,
      },
      update: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
        orderChanges: {
          ...order.orderChanges,
          refundAt: new Date(),
          refundBy: user._id,
        },
      },
    });

    return {
      message: 'Payment Refunded Successfully',
      order: updatedOrder,
    };
  }

  async getMyOrders(user: any) {
    return await this.orderModel.find({
      filter: {
        userId: user._id,
      },
      options: {
        sort: {
          createdAt: -1,
        },
        populate: [
          {
            path: 'coupon',
            select: 'code amount',
          },
        ],
      },
    });
  }

  async getAllOrders(query: PaginationDto) {
    const { page, limit } = query;

    return await this.orderModel.pagination({
      page,
      limit,
      sort: {
        createdAt: -1,
      },
      populate: [
        {
          path: 'userId',
          select: 'userName email phone',
        },
        {
          path: 'coupon',
          select: 'code amount',
        },
      ],
    });
  }

  async getOrderById(id: Types.ObjectId, user: any) {
    const filter: any = {
      _id: id,
    };

    if (user.role !== RoleEnum.admin) {
      filter.userId = user._id;
    }

    const order = await this.orderModel.findOne({
      filter,
      options: {
        populate: [
          { path: 'userId', select: 'userName email phone' },
          { path: 'coupon', select: 'code amount' },
        ],
      },
    });

    if (!order) {
      throw new NotFoundException('Order Not Found');
    }

    return order;
  }

  async cancelOrder(id: Types.ObjectId, user: any) {
    const order = await this.orderModel.findOne({
      filter: {
        _id: id,
        userId: user._id,
        status: OrderStatus.PENDING,
      },
    });

    if (!order) {
      throw new BadRequestException('Order Cannot Be Cancelled');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Paid Orders Must Be Refunded Before Cancellation',
      );
    }

    for (const item of order.products) {
      await this.productModel.findOneAndUpdate({
        filter: {
          _id: item.productId,
        },
        update: {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
      });
    }

    if (order.coupon) {
      await this.couponModel.findOneAndUpdate({
        filter: {
          _id: order.coupon,
        },
        update: {
          $pull: {
            usedBy: user._id,
          },
        },
      });
    }

    await this.cartModel.findOneAndUpdate({
      filter: {
        _id: order.cart,
      },
      update: {
        isOrdered: false,
      },
    });

    const updatedOrder = await this.orderModel.findOneAndUpdate({
      filter: {
        _id: order._id,
      },
      update: {
        status: OrderStatus.CANCELLED,
      },
    });

    return {
      message: 'Order Cancelled Successfully',
      order: updatedOrder,
    };
  }
}
