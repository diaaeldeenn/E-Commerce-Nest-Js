import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from '../../DB/repository/user.repository';
import { UserModel } from '../../DB/models/user.model';
import BrandRepository from '../../DB/repository/brand.repository';
import { BrandModel } from '../../DB/models/brand.model';
import { S3Service } from '../../common/service/s3.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from '../../DB/models/category.model';
import CategoryRepository from '../../DB/repository/category.repository';
import { CategoryService } from './category.service';

@Module({
  imports: [CategoryModel, UserModel, BrandModel],
  controllers: [CategoryController],
  providers: [
    JwtService,
    UserRepository,
    BrandRepository,
    S3Service,
    CategoryRepository,
    CategoryService,
  ],
})
export class CategoryModule {}
