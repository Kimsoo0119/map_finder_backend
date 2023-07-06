import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/common/interface/common-interface';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/signin/kakao')
  async signInKakao(
    @Query('authorizationCode') authorizationCode: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email: unregisteredUserEmail, token } =
      await this.authService.signInWithKakao(authorizationCode);
    if (!unregisteredUserEmail) {
      response.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
      });

      return { accessToken: token.accessToken };
    }

    return { unregisteredUserEmail };
  }

  @Get('/test')
  @UseGuards(JwtAuthGuard)
  async test(@GetUser() user: User) {
    console.log(user);
  }
}
