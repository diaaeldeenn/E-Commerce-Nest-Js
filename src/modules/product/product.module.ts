import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import BrandRepository from 'src/DB/repository/brand.repository';
import { BrandModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/common/service/s3.service';
import { CategoryModel } from 'src/DB/models/category.model';
import CategoryRepository from 'src/DB/repository/category.repository';
import { ProductModel } from 'src/DB/models/product.model';
import { ProductController } from './product.controller';
import ProductRepository from 'src/DB/repository/product.repository';
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
    UserRepository
  ],
})
export class ProductModule {}
