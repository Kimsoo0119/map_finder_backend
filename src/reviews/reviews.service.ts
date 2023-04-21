import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateSimpleReviewDto } from './dto/update-simple-review.dto';
import { DeleteReviewDto } from './dto/delete-reveiw-dto';
import { DetailedReview, SimpleReview } from './interface/reviews.interface';
import { DetailedReviews, Places, Users } from '@prisma/client';
import { CreateDetailedReviewDto } from './dto/create-detailed-review.dto';
import { UpdateDetailedReviewDto } from './dto/update-detailed-review.dto';

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

  private async checkPlaceExists(placeId: number): Promise<Places> {
    const selectedPlace: Places = await this.prisma.places.findUnique({
      where: {
        id: placeId,
      },
    });

    if (!selectedPlace) {
      throw new NotFoundException(`존재하지 않는 가게입니다.`);
    }
    return selectedPlace;
  }

  async updateSimpleReview({
    reviewId,
    userId,
    stars,
    description,
  }: UpdateSimpleReviewDto): Promise<void> {
    await this.checkUserExists(userId);
    await this.checkSimpleReviewExistsByUserIdAndId(userId, reviewId);
    await this.prisma.simpleReviews.update({
      where: { id: reviewId },
      data: { description, stars },
    });
  }

  private async checkSimpleReviewExistsByUserIdAndId(
    userId: number,
    reviewId: number,
  ): Promise<void> {
    const review = await this.prisma.simpleReviews.findFirst({
      where: { id: reviewId, userId },
      select: { userId: true },
    });
    if (!review) {
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
  async getDetailedReviewsByUserId(userId: number): Promise<DetailedReview[]> {
    const detailedReviews: DetailedReview[] =
      await this.prisma.detailedReviews.findMany({
        where: { userId },
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

  async createDetailedReview(
    createDetailedReviewDto: CreateDetailedReviewDto,
  ): Promise<void> {
    const { userId, placeId } = createDetailedReviewDto;
    await this.checkUserExists(userId);
    await this.checkPlaceExists(placeId);

    await this.prisma.detailedReviews.create({ data: createDetailedReviewDto });
  }

  async updateDetailedReview(
    updateDetailedReviewDto: UpdateDetailedReviewDto,
  ): Promise<void> {
    const { userId, placeId, reviewId, description, isUnisex, location } =
      updateDetailedReviewDto;
    await this.checkUserExists(userId);
    await this.checkDetailedReviewAuthorship({ reviewId, placeId, userId });

    await this.prisma.detailedReviews.update({
      where: { id: reviewId },
      data: { description, isUnisex, location },
    });
  }

  private async checkDetailedReviewAuthorship({
    reviewId,
    placeId,
    userId,
  }): Promise<void> {
    const detailedReview: DetailedReviews =
      await this.prisma.detailedReviews.findFirst({
        where: { id: reviewId, placeId },
      });

    if (!detailedReview) {
      throw new NotFoundException(`해당 리뷰가 존재하지 않습니다.`);
    }
    if (detailedReview.userId !== userId) {
      throw new BadRequestException(`작성자만 수정할 수 있습니다.`);
    }
  }
}
