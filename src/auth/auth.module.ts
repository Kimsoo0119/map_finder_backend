import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtModule } from 'src/common/config/jwt.module.config';

@Module({
  imports: [jwtModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
