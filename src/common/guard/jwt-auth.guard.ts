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
import { TokenPayload } from '../interface/common-interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    if (!parentCanActivate) {
      throw new UnauthorizedException(`인증에 실패했습니다.`);
    }

    const request = context.switchToHttp().getRequest();
    const tokenUser: TokenPayload = request.user;
    const { targetName, targetId } = request.body;

    const authorizedUser: Users = await this.prisma.users.findUnique({
      where: { id: tokenUser.id },
    });
    if (!authorizedUser) {
      throw new NotFoundException(`유효하지않은 유저입니다.`);
    }
    request.user = authorizedUser;

    if (targetName && targetId) {
      try {
        const { userId: targetUserId } = await this.prisma[
          targetName
        ].findUnique({
          where: { id: targetId },
          select: { userId: true },
        });

        if (targetUserId !== tokenUser.id) {
          throw new ForbiddenException(`권한이 없습니다.`);
        }
      } catch (error) {
        throw new NotFoundException(`대상이 존재하지 않습니다.`);
      }
    }

    return true;
  }
}
