import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from '../../DB/repository/user.repository';
import { UserModel } from '../../DB/models/user.model';
import BrandRepository from '../../DB/repository/brand.repository';
import { BrandModel } from '../../DB/models/brand.model';
import { S3Service } from '../../common/service/s3.service';
import { CategoryModel } from '../../DB/models/category.model';
import CategoryRepository from '../../DB/repository/category.repository';
import { ProductModel } from '../../DB/models/product.model';
import { ProductController } from './product.controller';
import ProductRepository from '../../DB/repository/product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [ProductModel, CategoryModel, UserModel, BrandModel],
  controllers: [ProductController],
  providers: [
    JwtService,
    UserRepository,
    BrandRepository,
    S3Service,
    CategoryRepository,
    ProductRepository,
    ProductService,
    UserRepository,
  ],
})
export class ProductModule {}
