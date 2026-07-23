import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import CartRepository from '../../DB/repository/cart.repository';
import ProductRepository from '../../DB/repository/product.repository';
import { AddToCartDto, UpdateCartQuantityDto } from './cart.dto';
import { CartProduct } from '../../DB/models/cart.model';

@Injectable()
export class CartService {
  private calculateSubTotal(products: CartProduct[]) {
    return products.reduce(
      (total, item) => total + item.quantity * item.finalPrice,
      0,
    );
  }
  private getFinalPrice(product: { price: number; discount?: number }) {
    return product.price - (product.discount ?? 0);
  }
  private async getUserCart(userId: Types.ObjectId, populate = false) {
    return this.cartModel.findOne({
      filter: {
        createdBy: userId,
        isOrdered: false,
        deletedAt: { $exists: false },
      },
      options: populate
        ? {
            populate: {
              path: 'products.productId',
              select: 'name slug mainImage price discount stock',
            },
          }
        : undefined,
    });
  }
  private async getProduct(productId: string) {
    const productObjectId = Types.ObjectId.createFromHexString(productId);

    const product = await this.productModel.findById(productObjectId);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product Not Found');
    }

    return product;
  }
  private async saveCart(cart: any) {
    cart.markModified('products');
    return this.cartModel.findOneAndUpdate({
      filter: { _id: cart._id },
      update: {
        products: cart.products,
        subTotal: this.calculateSubTotal(cart.products),
      },
    });
  }

  constructor(
    private readonly cartModel: CartRepository,
    private readonly productModel: ProductRepository,
  ) {}
  async addToCart(body: AddToCartDto, user: any) {
    const { productId, quantity } = body;

    const product = await this.getProduct(productId);

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient Stock');
    }

    const finalPrice = this.getFinalPrice(product);

    let cart = await this.getUserCart(user._id);

    if (!cart) {
      const products: CartProduct[] = [
        {
          productId: product._id,
          quantity,
          finalPrice,
        } as CartProduct,
      ];

      cart = await this.cartModel.create({
        createdBy: user._id,
        products,
        subTotal: this.calculateSubTotal(products),
      });

      return cart;
    }

    const existProduct = cart.products.find(
      (item) => item.productId.toString() === productId,
    );

    if (existProduct) {
      existProduct.quantity += quantity;

      if (existProduct.quantity > product.stock) {
        throw new BadRequestException('Insufficient Stock');
      }
    } else {
      const cartItem: CartProduct = {
        productId: product._id,
        quantity,
        finalPrice,
      };
      cart.products.push(cartItem);
    }

    return await this.saveCart(cart);
  }
  async getCart(user: any) {
    const cart = await this.getUserCart(user._id, true);

    if (!cart) {
      return {
        subTotal: 0,
        products: [],
      };
    }

    return cart;
  }
  async updateQuantity(body: UpdateCartQuantityDto, user: any) {
    const { productId, quantity } = body;

    const cart = await this.getUserCart(user._id);

    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }

    const product = await this.getProduct(productId);

    if (quantity > product.stock) {
      throw new BadRequestException('Insufficient Stock');
    }

    const cartProduct = cart.products.find(
      (item) => item.productId.toString() === productId,
    );

    if (!cartProduct) {
      throw new NotFoundException('Product Not Found In Cart');
    }

    cartProduct.quantity = quantity;
    cartProduct.finalPrice = this.getFinalPrice(product);

    return await this.saveCart(cart);
  }
  async increaseQuantity(params: any, user: any) {
    const { productId } = params;

    const cart = await this.getUserCart(user._id);

    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }

    const product = await this.getProduct(productId);

    const cartProduct = cart.products.find(
      (item) => item.productId.toString() === productId,
    );

    if (!cartProduct) {
      throw new NotFoundException('Product Not Found In Cart');
    }

    if (cartProduct.quantity >= product.stock) {
      throw new BadRequestException('Insufficient Stock');
    }

    cartProduct.quantity++;

    return await this.saveCart(cart);
  }
  async decreaseQuantity(params: any, user: any) {
    const { productId } = params;

    const cart = await this.getUserCart(user._id);

    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }

    const cartProduct = cart.products.find(
      (item) => item.productId.toString() === productId,
    );

    if (!cartProduct) {
      throw new NotFoundException('Product Not Found In Cart');
    }

    if (cartProduct.quantity <= 1) {
      throw new BadRequestException(
        'Quantity Cannot Be Less Than One, Use Remove Instead',
      );
    }

    cartProduct.quantity--;

    return await this.saveCart(cart);
  }
  async removeProduct(params: any, user: any) {
    const { productId } = params;

    const cart = await this.getUserCart(user._id);

    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }

    const index = cart.products.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (index === -1) {
      throw new NotFoundException('Product Not Found In Cart');
    }

    cart.products.splice(index, 1);

    return await this.saveCart(cart);
  }
  async clearCart(user: any) {
    const cart = await this.getUserCart(user._id);

    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }

    await this.cartModel.findOneAndUpdate({
      filter: { _id: cart._id },
      update: {
        products: [],
        subTotal: 0,
      },
    });

    return {
      message: 'Cart Cleared Successfully',
    };
  }
}
