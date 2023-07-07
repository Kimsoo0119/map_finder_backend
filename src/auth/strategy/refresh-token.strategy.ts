import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { request } from 'http';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/common/interface/common-interface';
import { CookiesTokenExtractor } from '../extractor/cookie-token-extractor';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      jwtFromRequest: CookiesTokenExtractor.fromCookies(),
    });
  }

  validate(tokenPayload: TokenPayload): TokenPayload {
    return tokenPayload;
  }
}
