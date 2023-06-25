import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly kakaoOAuthApiUrl: string;
  private readonly kakaoGrantType: string;
  private readonly kakaoClientId: string;
  private readonly kakaoRedirectUri: string;
  private readonly kakaoGetUserUri: string;

  constructor(private readonly prisma: PrismaService) {
    this.kakaoOAuthApiUrl = process.env.KAKAO_OAUTH_TOKEN_API_URL;
    this.kakaoGrantType = process.env.KAKAO_GRANT_TYPE;
    this.kakaoClientId = process.env.KAKAO_JAVASCRIPT_KEY;
    this.kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;
    this.kakaoGetUserUri = process.env.KAKAO_GET_USER_URI;
  }
  async signinWithKakao(authorizationCode: string) {
    console.log(
      `${this.kakaoOAuthApiUrl}?grant_type=${this.kakaoGrantType}&client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUri}&code=${authorizationCode}`,
    );

    const data = await axios
      .post(
        `${this.kakaoOAuthApiUrl}?grant_type=${this.kakaoGrantType}&client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUri}&code=${authorizationCode}`,
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      )
      .then((res) => {
        if (res.data) {
          return res.data;
        }
      });
    console.log(data.access_token);
    const user = await axios
      .post(
        this.kakaoGetUserUri,
        {},
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            'Content-type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => console.log(res));
  }
}
