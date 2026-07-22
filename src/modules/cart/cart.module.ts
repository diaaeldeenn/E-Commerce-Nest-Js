import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { CartController } from './cart.controller';
import { CartModel } from 'src/DB/models/cart.model';
import { CartService } from './cart.service';
import CartRepository from 'src/DB/repository/cart.repository';
import ProductRepository from 'src/DB/repository/product.repository';
import { ProductModel } from 'src/DB/models/product.model';

@Module({
  imports: [CartModel, UserModel,ProductModel],
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
