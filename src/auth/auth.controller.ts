import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/common/interface/common-interface';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Response } from 'express';
import { RefreshTokenGuard } from 'src/common/guard/refresh-token.guard';

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

  @Get('/token')
  @UseGuards(RefreshTokenGuard)
  async refreshRefreshToken() {}

  @Get('/test')
  @UseGuards(AccessTokenGuard)
  async test(@GetUser() user: User) {
    console.log(user);
  }
}
