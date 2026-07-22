import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import CouponRepository from 'src/DB/repository/coupon.repository';
import CartRepository from 'src/DB/repository/cart.repository';
import { CreateCouponDto, UpdateCouponDto, ApplyCouponDto } from './coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponModel: CouponRepository,
    private readonly cartModel: CartRepository,
  ) {}

  async validateCoupon(
    code: string,
    userId: Types.ObjectId,
    cartSubTotal: number,
  ) {
    const currentDate = new Date();

    const coupon = await this.couponModel.findOne({
      filter: {
        code,
        isActive: true,
        deletedAt: { $exists: false },
        fromDate: { $lte: currentDate },
        toDate: { $gte: currentDate },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid Or Expired Coupon');
    }

    if (cartSubTotal < coupon.minOrderPrice) {
      throw new BadRequestException(
        `Minimum Order Price Is ${coupon.minOrderPrice}`,
      );
    }

    const alreadyUsed = coupon.usedBy?.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyUsed) {
      throw new BadRequestException('Coupon Already Used By This User');
    }

    return coupon;
  }
  private async getCoupon(couponId: string) {
    const couponObjectId = Types.ObjectId.createFromHexString(couponId);

    const coupon = await this.couponModel.findById(couponObjectId);

    if (!coupon || coupon.deletedAt) {
      throw new NotFoundException('Coupon Not Found');
    }

    return coupon;
  }

  private async saveCoupon(coupon: any) {
    return this.couponModel.findOneAndUpdate({
      filter: { _id: coupon._id },
      update: {
        code: coupon.code,
        amount: coupon.amount,
        fromDate: coupon.fromDate,
        toDate: coupon.toDate,
        minOrderPrice: coupon.minOrderPrice,
        isActive: coupon.isActive,
      },
    });
  }

  async createCoupon(body: CreateCouponDto, user: any) {
    const { code, amount, fromDate, toDate, minOrderPrice, isActive } = body;

    if (
      await this.couponModel.findOne({
        filter: {
          code,
          deletedAt: { $exists: false },
        },
      })
    ) {
      throw new ConflictException('Coupon Code Already Exists');
    }

    const coupon = await this.couponModel.create({
      code,
      amount,
      fromDate,
      toDate,
      minOrderPrice: minOrderPrice ?? 0,
      isActive: isActive ?? true,
      createdBy: user._id,
    });

    return coupon;
  }

  async updateCoupon(couponId: string, body: UpdateCouponDto) {
    const coupon = await this.getCoupon(couponId);

    const { code, amount, fromDate, toDate, minOrderPrice, isActive } = body;

    if (
      code &&
      code !== coupon.code &&
      (await this.couponModel.findOne({
        filter: {
          code,
          deletedAt: { $exists: false },
        },
      }))
    ) {
      throw new ConflictException('Coupon Code Already Exists');
    }

    const newFromDate = fromDate ? new Date(fromDate) : coupon.fromDate;
    const newToDate = toDate ? new Date(toDate) : coupon.toDate;

    if (newFromDate >= newToDate) {
      throw new BadRequestException('From Date Must Be Less Than To Date');
    }

    if (newToDate < new Date()) {
      throw new BadRequestException(
        'Coupon Expiration Date Cannot Be In The Past',
      );
    }

    if (fromDate && newFromDate < new Date()) {
      throw new BadRequestException('From Date Cannot Be In The Past');
    }

    coupon.code = code ?? coupon.code;
    coupon.amount = amount ?? coupon.amount;
    coupon.fromDate = newFromDate;
    coupon.toDate = newToDate;
    coupon.minOrderPrice = minOrderPrice ?? coupon.minOrderPrice;
    coupon.isActive = isActive ?? coupon.isActive;

    return await this.saveCoupon(coupon);
  }

  async getCoupons() {
    return await this.couponModel.find({
      filter: {
        deletedAt: { $exists: false },
      },
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });
  }

  async deleteCoupon(couponId: string, user: any) {
    const coupon = await this.getCoupon(couponId);

    await this.couponModel.findOneAndUpdate({
      filter: {
        _id: coupon._id,
      },
      update: {
        deletedAt: new Date(),
        deletedBy: user._id,
        isActive: false,
      },
    });

    return {
      message: 'Coupon Deleted Successfully',
    };
  }

  async applyCoupon(body: ApplyCouponDto, user: any) {
    const cart = await this.cartModel.findOne({
      filter: {
        createdBy: user._id,
        isOrdered: false,
        deletedAt: { $exists: false },
      },
    });

    if (!cart || !cart.products.length) {
      throw new NotFoundException('Cart Not Found Or Empty');
    }

    const coupon = await this.validateCoupon(
      body.code,
      user._id,
      cart.subTotal,
    );

    const discountValue = (cart.subTotal * coupon.amount) / 100;

    return {
      message: 'Coupon Applied Successfully',
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        amount: coupon.amount,
        discountValue,
        finalTotal: cart.subTotal - discountValue,
      },
    };
  }
}
