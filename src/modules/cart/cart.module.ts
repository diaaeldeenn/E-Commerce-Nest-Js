import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from '../../DB/repository/user.repository';
import { UserModel } from '../../DB/models/user.model';
import { CartController } from './cart.controller';
import { CartModel } from '../../DB/models/cart.model';
import { CartService } from './cart.service';
import CartRepository from '../../DB/repository/cart.repository';
import ProductRepository from '../../DB/repository/product.repository';
import { ProductModel } from '../../DB/models/product.model';

@Module({
  imports: [CartModel, UserModel, ProductModel],
  controllers: [CartController],
  providers: [
    JwtService,
    UserRepository,
    CartService,
    CartRepository,
    ProductRepository,
  ],
})
export class CartModule {}
