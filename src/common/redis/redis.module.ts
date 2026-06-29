import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = createClient({
          url: process.env.REDIS_URL,
        });
        console.log('Redis Connected Succefully');
        await redis.connect();
        redis.on('error', (err) => {
          console.log('Redis Connected Error');
        });
        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
