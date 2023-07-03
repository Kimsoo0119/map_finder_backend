import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/common/interface/common-interface';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async test() {}
}
