import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from '../../DB/models/user.model';
import UserRepository from '../../DB/repository/user.repository';
import RedisService from '../../common/service/redis.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from '../../common/service/s3.service';

@Module({
  imports: [UserModel],
  controllers: [UserController],
  providers: [UserService, UserRepository, RedisService, JwtService, S3Service],
})
export class UserModule {}
