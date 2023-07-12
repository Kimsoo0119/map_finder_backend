import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RequestWithTokenPayload,
  TokenPayload,
} from '../interface/common-interface';

@Injectable()
export class AccessTokenGuard extends AuthGuard('accessToken') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    if (!parentCanActivate) {
      throw new UnauthorizedException(`인증에 실패했습니다.`);
    }

    const request: RequestWithTokenPayload = context
      .switchToHttp()
      .getRequest();
    const tokenUser: TokenPayload = request.user;

    const authorizedUser: Users = await this.prisma.users.findUnique({
      where: { id: tokenUser.id },
    });
    if (!authorizedUser) {
      throw new NotFoundException(`유효하지않은 유저입니다.`);
    }

    request.authorizedUser = authorizedUser;

    return true;
  }
}
