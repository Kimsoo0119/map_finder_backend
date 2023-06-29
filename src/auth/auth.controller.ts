import { CACHE_MANAGER, Controller, Get, Inject, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/common/interface/common-interface';
import { Cache } from 'cache-manager';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly authService: AuthService,
  ) {}

  @Get('/signin/kakao')
  async signInKakao(
    @Query('authorizationCode') authorizationCode: string,
  ): Promise<string | User> {
    const user: string | User = await this.authService.signInWithKakao(
      authorizationCode,
    );

    return user;
  }
}
