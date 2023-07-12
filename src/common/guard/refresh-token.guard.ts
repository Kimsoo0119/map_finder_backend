import {
  CACHE_MANAGER,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  RequestWithTokenPayload,
  TokenPayload,
} from '../interface/common-interface';
import { Cache } from 'cache-manager';
import { Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refreshToken') {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {
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
    const cookiesRefreshToken: string = request.cookies.refreshToken;

    const authorizedUser: Users = await this.prisma.users.findUnique({
      where: { id: tokenUser.id },
    });
    if (!authorizedUser) {
      throw new NotFoundException(`유효하지않은 유저입니다.`);
    }

    const cachedRefreshToken = await this.cacheManager.get(`${tokenUser.id}`);
    if (!cachedRefreshToken) {
      throw new UnauthorizedException(
        `로그인 정보가 만료되었습니다 다시 로그인해 주세요`,
      );
    }

    if (cookiesRefreshToken !== cachedRefreshToken) {
      await this.cacheManager.del(`${tokenUser.id}`);
      throw new UnauthorizedException(
        `잘못된 로그인 정보입니다. 다시 로그인해 주세요`,
      );
    }

    request.authorizedUser = authorizedUser;
    return true;
  }
}
