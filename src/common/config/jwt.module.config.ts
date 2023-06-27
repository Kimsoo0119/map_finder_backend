import { JwtModule } from '@nestjs/jwt';

export const JwtCustomModule = JwtModule.registerAsync({
  useFactory: () => ({
    secret: process.env.JWT_SECRET_KEY,
  }),
});
