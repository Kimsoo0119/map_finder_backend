import { Controller, Delete, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/common/interface/common-interface';
import { Response } from 'express';
import { RefreshTokenGuard } from 'src/common/guard/refresh-token.guard';
import { GetAuthorizedUser } from 'src/common/decorator/get-user.decorator';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';

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

    return { unregisteredUserEmail, signUpType: 'KAKAO' };
  }

  @Get('/token')
  @UseGuards(RefreshTokenGuard)
  async refreshJwtToken(
    @GetAuthorizedUser() authorizedUser: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.generateJwtToken({
        id: authorizedUser.id,
        nickname: authorizedUser.nickname,
      });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return { accessToken, msg: '토큰 재발급 완료' };
  }

  @Delete('/logout')
  @UseGuards(AccessTokenGuard)
  async logOut(
    @GetAuthorizedUser() authorizedUser: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.deleteRefreshToken(authorizedUser.id);
    response.clearCookie('refreshToken');

    return { success: true, msg: '로그아웃 완료' };
  }
}
