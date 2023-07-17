import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Post('/signup')
  async signUpWithOAuth(@Body() createUserDto: CreateUserDto) {
    await this.userService.createUserWithOAuth(createUserDto);

    return { message: '회원가입 완료' };
  }

  @Get('/nickname/:nickname')
  async checkDuplicateNickname(@Param('nickname') nickname: string) {
    await this.userService.checkDuplicateNickname(nickname);

    return { message: '사용 가능한 닉네임 입니다.' };
  }

  @Get('/email/:email')
  async checkDuplicateEmail(@Param('email') email: string) {
    await this.userService.checkDuplicateEmail(email);

    return { message: '사용 가능한 닉네임 입니다.' };
  }
}
