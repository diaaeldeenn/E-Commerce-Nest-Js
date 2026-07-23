import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { JwtService } from '@nestjs/jwt';
import UserRepository from '../../DB/repository/user.repository';
import { UserModel } from '../../DB/models/user.model';
import BrandRepository from '../../DB/repository/brand.repository';
import { BrandModel } from '../../DB/models/brand.model';
import { S3Service } from '../../common/service/s3.service';

@Module({
  imports: [UserModel, BrandModel],
  controllers: [BrandController],
  providers: [
    BrandService,
    UserRepository,
    BrandRepository,
    JwtService,
    S3Service,
  ],
})
export class BrandModule {}
