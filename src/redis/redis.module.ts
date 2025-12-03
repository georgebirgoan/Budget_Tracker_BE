import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';

export const REDIS = 'REDIS_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async () => {
        const client = createClient({
          url: process.env.REDIS_URL || 'redis://redis:6379',
        });

        client.on('connect', () => console.log('🔌 Redis connected'));
        client.on('error', (err) => console.error('❌ Redis error', err));
        
      
        await client.connect();

        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
