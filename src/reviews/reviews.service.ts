import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSimpleReviews(placeId: number) {
    try {
      const reviews = await this.prisma.simpleReviews.findMany({
        where: { placeId },
        select: {
          id: true,
          description: true,
          user: { select: { name: true } },
        },
      });
      return reviews;
    } catch (error) {
      throw new InternalServerErrorException({
        location: 'getSimpleReviews',
        error,
        message: '알 수 없는 서버 에러입니다.',
      });
    }
  }
}
