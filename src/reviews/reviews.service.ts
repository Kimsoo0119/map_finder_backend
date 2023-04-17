import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateSimpleReviewDto } from './dto/update-simple-review.dto';
import { SimpleReviews } from '@prisma/client';

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
          stars: true,
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

  async createSimpleReview(createReviewDto: CreateReviewDto): Promise<void> {
    try {
      const { userId, placeId } = createReviewDto;

      await this.checkUserExists(userId);
      await this.checkPlaceExists(placeId);
      await this.prisma.simpleReviews.create({ data: createReviewDto });
    } catch (error) {
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

  async updateSimpleReview({
    reviewId,
    userId,
    stars,
    description,
  }: UpdateSimpleReviewDto): Promise<void> {
    try {
      await this.checkSimpleReviewExistsByUserIdAndId(reviewId, userId);
      await this.prisma.simpleReviews.updateMany({
        where: { id: reviewId, userId },
        data: { description, stars },
      });
    } catch (error) {
      throw error;
    }
  }

  private async checkSimpleReviewExistsByUserIdAndId(
    reviewId: number,
    userId: number,
  ): Promise<void> {
    try {
      const review = await this.prisma.simpleReviews.findMany({
        where: { id: reviewId, userId },
        select: { userId: true },
      });
      if (!review.length) {
        throw new NotFoundException(`존재하지 않는 리뷰입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }
}
