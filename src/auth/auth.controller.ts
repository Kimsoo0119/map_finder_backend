import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/signin/kakao')
  async signinKakao(@Query('authorizationCode') authorizationCode: string) {
    await this.authService.signinWithKakao(authorizationCode);
  }
}
