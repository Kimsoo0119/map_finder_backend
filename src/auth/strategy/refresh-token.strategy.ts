import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { request } from 'http';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/common/interface/common-interface';
import { CookiesTokenExtractor } from '../extractor/cookie-token-extractor';
import { Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      jwtFromRequest: CookiesTokenExtractor.fromCookies(),
      passReqToCallback: true,
    });
  }

  async validate(request, tokenPayload: TokenPayload): Promise<Users> {
    const cookiesRefreshToken: string = request.cookies.refreshToken;

    const authorizedUser: Users = await this.authService.getUserByUserId(
      tokenPayload.id,
    );
    await this.authService.validateRefreshToken(
      cookiesRefreshToken,
      authorizedUser.id,
    );

    return authorizedUser;
  }
}
