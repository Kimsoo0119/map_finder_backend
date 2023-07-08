import { CacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

export const CacheCustomModule = CacheModule.register({
  isGlobal: true,
  useFactory: (configService: ConfigService) => ({
    store: localStorage,
    host: 'localhost', //configService.get<string>('REDIS_URL'),
    port: 6379, //configService.get<string>('REDIS_PORT'),
  }),
});
