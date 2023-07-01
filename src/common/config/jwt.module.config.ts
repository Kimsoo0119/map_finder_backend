import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const JwtCustomModule = JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET_KEY'),
  }),
  inject: [ConfigService],
});
