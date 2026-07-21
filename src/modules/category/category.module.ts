import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import BrandRepository from 'src/DB/repository/brand.repository';
import { BrandModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/common/service/s3.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from 'src/DB/models/category.model';
import CategoryRepository from 'src/DB/repository/category.repository';
import { CategoryService } from './category.service';


@Module({
  imports: [CategoryModel,UserModel,BrandModel],
  controllers: [CategoryController],
  providers: [JwtService,UserRepository,BrandRepository,S3Service,CategoryRepository,CategoryService],
})
export class CategoryModule {}
