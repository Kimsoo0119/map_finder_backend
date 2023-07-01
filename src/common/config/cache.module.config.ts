import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';

export const CacheCustomModule = CacheModule.register({
  ttl: parseInt(process.env.REDIS_TOKEN_TTL),
  useFactory: () => ({
    store: redisStore,
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
  }),
});
