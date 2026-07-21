import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { JwtService } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import BrandRepository from 'src/DB/repository/brand.repository';
import { BrandModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/common/service/s3.service';

@Module({
  imports: [UserModel,BrandModel],
  controllers: [BrandController],
  providers: [BrandService,UserRepository,BrandRepository,JwtService,S3Service],
})
export class BrandModule {}
