import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { CouponModel } from 'src/DB/models/coupon.model';
import CouponRepository from 'src/DB/repository/coupon.repository';
import { OrderModel } from 'src/DB/models/order.model';
import OrderRepository from 'src/DB/repository/order.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import CartRepository from 'src/DB/repository/cart.repository';
import ProductRepository from 'src/DB/repository/product.repository';
import { ProductModel } from 'src/DB/models/product.model';
import { CartModel } from 'src/DB/models/cart.model';
import { CouponService } from '../coupon/coupon.service';
import { StripeService } from 'src/common/service/stripe.service';

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
    StripeService
  ],
})
export class OrderModule {}
