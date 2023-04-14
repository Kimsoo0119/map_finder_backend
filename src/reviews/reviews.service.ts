import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

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

  async createSimpleReview(review: CreateReviewDto): Promise<void> {
    try {
      const { userId, placeId } = review;

      await this.checkUserExists(userId);
      await this.checkPlaceExists(placeId);
      await this.prisma.simpleReviews.create({ data: review });
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  private async checkUserExists(userId: number): Promise<void> {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException(`존재하지 않는 유저입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }

  private async checkPlaceExists(placeId: number): Promise<void> {
    try {
      const place = await this.prisma.places.findUnique({
        where: {
          id: placeId,
        },
      });

      if (!place) {
        throw new NotFoundException(`존재하지 않는 가게입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }
}
