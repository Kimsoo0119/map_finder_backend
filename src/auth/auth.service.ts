import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Token, User } from 'src/common/interface/common-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { SignUpType, Users } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly kakaoOAuthApiUrl: string;
  private readonly kakaoGrantType: string;
  private readonly kakaoClientId: string;
  private readonly kakaoRedirectUri: string;
  private readonly kakaoGetUserUri: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.kakaoOAuthApiUrl = configService.get<string>(
      'KAKAO_OAUTH_TOKEN_API_URL',
    );
    this.kakaoGrantType = configService.get<string>('KAKAO_GRANT_TYPE');
    this.kakaoClientId = configService.get<string>('KAKAO_JAVASCRIPT_KEY');
    this.kakaoRedirectUri = configService.get<string>('KAKAO_REDIRECT_URI');
    this.kakaoGetUserUri = configService.get<string>('KAKAO_GET_USER_URI');
    this.accessTokenExpiresIn = configService.get<string>(
      'ACCESS_TOKEN_EXPIRESIN',
    );
    this.refreshTokenExpiresIn = configService.get<string>(
      'REFRESH_TOKEN_EXPIRESIN',
    );
  }

  async signInWithKakao(authorizationCode: string): Promise<User> {
    const kakaoEmail: string = await this.getKakaoUserEmail(authorizationCode);
    const signUpType = SignUpType.KAKAO;

    const user: User = await this.getUserByEmail(kakaoEmail, signUpType);
    if (!user) {
      return { email: kakaoEmail };
    }

    const token = await this.generateJwtToken(user);

    return { token };
  }

  private async getKakaoUserEmail(authorizationCode): Promise<string> {
    try {
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

      return kakaoUserInfo.kakao_account.email;
    } catch (error) {
      throw new BadRequestException(`카카오 서버 요청 실패`);
    }
  }

  private async getUserByEmail(
    email: string,
    signUpType: SignUpType,
  ): Promise<User | null> {
    const user: User = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true, nickname: true, sign_up_type: true },
    });
    if (!user) {
      return null;
    }
    if (user.sign_up_type !== signUpType) {
      throw new BadRequestException(`다른 형식으로 가입된 이메일입니다.`);
    }

    return { id: user.id, nickname: user.nickname };
  }

  async generateJwtToken(userPayload: User): Promise<Token> {
    const accessToken = this.jwtService.sign(userPayload, {
      expiresIn: this.accessTokenExpiresIn,
    });
    const refreshToken = this.jwtService.sign(userPayload, {
      expiresIn: this.refreshTokenExpiresIn,
    });

    await this.cacheManager.set(`${userPayload.id}`, refreshToken, {
      ttl: this.configService.get<number>('REDIS_DATA_TTL'),
    });

    return { accessToken, refreshToken };
  }

  async getUserByUserId(userId: number): Promise<Users> {
    const user: Users = await this.prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`존재하지 않는 유저입니다.`);
    }

    return user;
  }

  async validateRefreshToken(
    userRefreshToken: string,
    userId: number,
  ): Promise<void> {
    const cachedRefreshToken = await this.cacheManager.get(`${userId}`);
    if (!cachedRefreshToken) {
      throw new UnauthorizedException(
        `로그인 정보가 만료되었습니다 다시 로그인해 주세요`,
      );
    }

    if (userRefreshToken !== cachedRefreshToken) {
      await this.cacheManager.del(`${userId}`);
      throw new UnauthorizedException(
        `잘못된 로그인 정보입니다. 다시 로그인해 주세요`,
      );
    }
  }

  async deleteRefreshToken(userId: number) {
    await this.cacheManager.del(`${userId}`);
  }
}
