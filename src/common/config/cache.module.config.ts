import { CacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

export const CacheCustomModule = CacheModule.register({
  isGlobal: true,
  useFactory: (configService: ConfigService) => ({
    store: redisStore,
    host: configService.get<string>('REDIS_URL'),
    port: configService.get<string>('REDIS_PORT'),
    ttl: configService.get<number>('REDIS_DATA_TTL'),
  }),
});
