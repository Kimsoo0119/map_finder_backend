import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCustomModule } from 'src/common/config/jwt.module.config';
import { CacheCustomModule } from 'src/common/config/cache.module.config';
import { JwtStrategy } from './strategy/jwt.startegy';

@Module({
  imports: [JwtCustomModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
