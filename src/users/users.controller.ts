import { Controller, Post, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/nickname/:nickname')
  async checkDuplicateNickname(@Param('nickname') nickname: string) {
    await this.userService.checkDuplicateNickname(nickname);

    return { message: '닉네임 사용 가능합니다.' };
  }
}
