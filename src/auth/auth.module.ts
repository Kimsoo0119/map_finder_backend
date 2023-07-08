import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCustomModule } from 'src/common/config/jwt.module.config';
import { AccessTokenStrategy } from './strategy/access-token.startegy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';

@Module({
  imports: [JwtCustomModule],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
