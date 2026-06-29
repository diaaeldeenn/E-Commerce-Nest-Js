import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './common/redis/redis.module';


@Module({
  imports: [ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_LOCAL!, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('Connected To DB'));
        connection.on('disconnected', () => console.log('Disconnected To DB'));
        return connection;
      },
    }),
    RedisModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
