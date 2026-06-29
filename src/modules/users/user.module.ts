import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import UserRepository from 'src/DB/repository/user.repository';
import RedisService from 'src/common/service/redis.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/common/service/s3.service';

@Module({
  imports: [UserModel],
  controllers: [UserController],
  providers: [UserService, UserRepository, RedisService, JwtService, S3Service],
})
export class UserModule {}
