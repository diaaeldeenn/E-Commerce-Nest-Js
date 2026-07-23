import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from '../../DB/repository/user.repository';
import { UserModel } from '../../DB/models/user.model';
import { CouponController } from './coupon.controller';
import { CouponModel } from '../../DB/models/coupon.model';
import { CouponService } from './coupon.service';
import CouponRepository from '../../DB/repository/coupon.repository';
import CartRepository from '../../DB/repository/cart.repository';
import { CartModel } from '../../DB/models/cart.model';

@Module({
  imports: [UserModel, CouponModel, CartModel],
  controllers: [CouponController],
  providers: [
    CouponService,
    UserRepository,
    CouponRepository,
    JwtService,
    CartRepository,
  ],
})
export class CouponModule {}
