import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/common/interface/common-interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/signin/kakao')
  async signInKakao(
    @Query('authorizationCode') authorizationCode: string,
  ): Promise<string | User> {
    const user: string | User = await this.authService.signInWithKakao(
      authorizationCode,
    );

    return user;
  }
  @Get('/test')
  async test() {
    await this.authService.test();
  }
}
