import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { CouponController } from './coupon.controller';
import { CouponModel } from 'src/DB/models/coupon.model';
import { CouponService } from './coupon.service';
import CouponRepository from 'src/DB/repository/coupon.repository';
import CartRepository from 'src/DB/repository/cart.repository';
import { CartModel } from 'src/DB/models/cart.model';

@Module({
  imports: [UserModel, CouponModel,CartModel],
  controllers: [CouponController],
  providers: [CouponService, UserRepository, CouponRepository, JwtService,CartRepository],
})
export class CouponModule {}
