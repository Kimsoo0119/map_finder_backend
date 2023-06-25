import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.registerAsync({
  useFactory: () => ({
    secret: process.env.JWT_SECRET_KEY,
  }),
});
