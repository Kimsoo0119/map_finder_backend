import { ConfigModule } from '@nestjs/config';

export const CustomConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  cache: true,
});
