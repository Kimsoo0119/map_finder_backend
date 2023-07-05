import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, tokenPayload) {
    const { targetName, targetId } = request.body;
    if (targetName && targetId) {
      const user = this.prismaService[targetName].findUnique({
        where: { id: targetId, userId: tokenPayload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('권한이 없습니다.');
      }
      return user;
    }

    return { userId: tokenPayload.id };
  }
}
