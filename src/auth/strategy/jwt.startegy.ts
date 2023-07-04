import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
    });
  }

  async validate(tokenPayload) {
    const tokenExpiration = tokenPayload.exp;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp >= tokenExpiration) {
      //토큰 만료시 refresh 토큰 로직
      return {};
    }

    return { userId: tokenPayload.id };
  }
}
