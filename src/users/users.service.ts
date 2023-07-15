import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async checkDuplicateNickname(nickname: string): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { nickname },
    });
    if (user) {
      throw new BadRequestException(`닉네임 중복입니다.`);
    }
  }
}
