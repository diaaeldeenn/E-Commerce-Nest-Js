import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from '../../DB/repository/user.repository';
import { UserModel } from '../../DB/models/user.model';
import { CouponModel } from '../../DB/models/coupon.model';
import CouponRepository from '../../DB/repository/coupon.repository';
import { OrderModel } from '../../DB/models/order.model';
import OrderRepository from '../../DB/repository/order.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import CartRepository from '../../DB/repository/cart.repository';
import ProductRepository from '../../DB/repository/product.repository';
import { ProductModel } from '../../DB/models/product.model';
import { CartModel } from '../../DB/models/cart.model';
import { CouponService } from '../coupon/coupon.service';
import { StripeService } from '../../common/service/stripe.service';

@Module({
  imports: [UserModel, CouponModel, OrderModel, ProductModel, CartModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    UserRepository,
    CouponRepository,
    OrderRepository,
    CartRepository,
    ProductRepository,
    JwtService,
    CouponService,
    StripeService,
  ],
})
export class OrderModule {}
