import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';
import axios from 'axios';
import { User } from 'src/common/interface/common-interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly kakaoOAuthApiUrl: string;
  private readonly kakaoGrantType: string;
  private readonly kakaoClientId: string;
  private readonly kakaoRedirectUri: string;
  private readonly kakaoGetUserUri: string;
  private readonly accessTokenExpiresIn: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.kakaoOAuthApiUrl = process.env.KAKAO_OAUTH_TOKEN_API_URL;
    this.kakaoGrantType = process.env.KAKAO_GRANT_TYPE;
    this.kakaoClientId = process.env.KAKAO_JAVASCRIPT_KEY;
    this.kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;
    this.kakaoGetUserUri = process.env.KAKAO_GET_USER_URI;
    this.accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRESIN;
  }
  async signinWithKakao(authorizationCode: string): Promise<string | User> {
    const { data: kakaoOauthServerResponse } = await axios.post(
      `${this.kakaoOAuthApiUrl}?grant_type=${this.kakaoGrantType}&client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUri}&code=${authorizationCode}`,
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      },
    );

    const { data: kakaoUserInfo } = await axios.post(
      this.kakaoGetUserUri,
      {},
      {
        headers: {
          Authorization: `Bearer ${kakaoOauthServerResponse.access_token}`,
          'Content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const userEmail: string = kakaoUserInfo.kakao_account.email;
    const user: User = await this.getUserByEmail(userEmail);
    if (!user) {
      return userEmail;
    }
    await this.generateToken(user);
    return user;
  }

  private async getUserByEmail(email): Promise<User> {
    const user: User = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, nickname: true },
    });
    return user;
  }

  private async generateToken(user) {
    const accessToken = this.jwtService.sign(user, {
      expiresIn: this.accessTokenExpiresIn,
    });
    console.log(accessToken);
  }
}
