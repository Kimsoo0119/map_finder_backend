import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDuplicateNickname(nickname: string): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { nickname },
    });
    if (user) {
      throw new BadRequestException(`이미 존재하는 닉네임 입니다.`);
    }
  }

  async checkDuplicateEmail(email): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (user) {
      throw new BadRequestException(`이미 존재하는 이메일 입니다.`);
    }
  }

  async createUserWithOAuth(user: CreateUserDto): Promise<void> {
    const { email, signUpType, nickname } = user;
    await this.checkDuplicateUser(user);

    await this.prisma.users.create({
      data: { email, sign_up_type: signUpType, nickname },
    });
  }

  private async checkDuplicateUser({
    email,
    nickname,
  }: CreateUserDto): Promise<void> {
    await this.checkDuplicateEmail(email);
    await this.checkDuplicateNickname(nickname);
  }
}
