import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateSimpleReviewDto } from './dto/update-simple-review.dto';
import { DeleteReviewDto } from './dto/delete-reveiw-dto';
import { DetailedReview, SimpleReview } from './interface/reviews.interface';
import { Places, Users } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSimpleReviews(placeId: number): Promise<SimpleReview[]> {
    const simpleReviews: SimpleReview[] =
      await this.prisma.simpleReviews.findMany({
        where: { placeId },
        select: {
          id: true,
          description: true,
          stars: true,
          user: { select: { name: true } },
        },
      });

    return simpleReviews;
  }

  async createSimpleReview(createReviewDto: CreateReviewDto): Promise<void> {
    const { userId, placeId } = createReviewDto;

    await this.checkUserExists(userId);
    await this.checkPlaceExists(placeId);
    await this.prisma.simpleReviews.create({ data: createReviewDto });
  }

  private async checkUserExists(userId: number): Promise<void> {
    const selectedUser: Users = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!selectedUser) {
      throw new NotFoundException(`존재하지 않는 유저입니다.`);
    }
  }

  private async checkPlaceExists(placeId: number): Promise<void> {
    const selectedPlace: Places = await this.prisma.places.findUnique({
      where: {
        id: placeId,
      },
    });

    if (!selectedPlace) {
      throw new NotFoundException(`존재하지 않는 가게입니다.`);
    }
  }

  async updateSimpleReview({
    reviewId,
    userId,
    stars,
    description,
  }: UpdateSimpleReviewDto): Promise<void> {
    await this.checkSimpleReviewExistsByUserIdAndId(userId, reviewId);
    await this.prisma.simpleReviews.updateMany({
      where: { id: reviewId, userId },
      data: { description, stars },
    });
  }

  private async checkSimpleReviewExistsByUserIdAndId(
    userId: number,
    reviewId: number,
  ): Promise<void> {
    const review = await this.prisma.simpleReviews.findMany({
      where: { id: reviewId, userId },
      select: { userId: true },
    });
    if (!review.length) {
      throw new NotFoundException(`존재하지 않는 리뷰입니다.`);
    }
  }

  async deleteSimpleReview({
    userId,
    reviewId,
  }: DeleteReviewDto): Promise<void> {
    await this.checkSimpleReviewExistsByUserIdAndId(userId, reviewId);
    await this.prisma.simpleReviews.deleteMany({
      where: { id: reviewId, userId },
    });
  }

  async getDetailedReviews(placeId: number): Promise<DetailedReview[]> {
    const detailedReviews: DetailedReview[] =
      await this.prisma.detailedReviews.findMany({
        where: { placeId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          isUnisex: true,
          location: true,
          description: true,
          user: { select: { name: true } },
        },
      });

    return detailedReviews;
  }

  async getSimpleReviewsByUserId(userId: number): Promise<SimpleReview[]> {
    const simpleReviews: SimpleReview[] =
      await this.prisma.simpleReviews.findMany({
        where: { userId },
        select: {
          id: true,
          description: true,
          stars: true,
          user: { select: { name: true } },
        },
      });

    return simpleReviews;
  }
}
