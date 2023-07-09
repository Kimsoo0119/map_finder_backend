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
import { DetailedReviews, Places, SimpleReviews, Users } from '@prisma/client';
import { CreateDetailedReviewDto } from './dto/create-detailed-review.dto';
import { UpdateDetailedReviewDto } from './dto/update-detailed-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSimpleReviews(placeId: number): Promise<SimpleReview[]> {
    const simpleReviews: SimpleReview[] =
      await this.prisma.simpleReviews.findMany({
        where: { place_id: placeId },
        select: {
          id: true,
          description: true,
          stars: true,
          user: { select: { nickname: true } },
        },
      });

    return simpleReviews;
  }

  async createSimpleReview(createReviewDto: CreateReviewDto): Promise<void> {
    const { userId, placeId, ...rest } = createReviewDto;

    await this.checkUserExists(userId);
    await this.checkPlaceExists(placeId);
    await this.prisma.simpleReviews.create({
      data: { user_id: userId, place_id: placeId, ...rest },
    });
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
    placeId,
  }: UpdateSimpleReviewDto): Promise<void> {
    await this.checkUserExists(userId);

    const isAuthorship: boolean = await this.checkSimpleReviewAuthorship({
      userId,
      reviewId,
      placeId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 수정 가능합니다`);
    }

    await this.prisma.simpleReviews.update({
      where: { id: reviewId },
      data: { description, stars },
    });
  }

  async deleteSimpleReview({
    userId,
    reviewId,
    placeId,
  }: DeleteReviewDto): Promise<void> {
    await this.checkUserExists(userId);

    const isAuthorship: boolean = await this.checkSimpleReviewAuthorship({
      userId,
      reviewId,
      placeId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 삭제할 수 있습니다.`);
    }

    await this.prisma.simpleReviews.deleteMany({
      where: { id: reviewId, user_id: userId },
    });
  }

  async getDetailedReviews(placeId: number): Promise<DetailedReview[]> {
    const detailedReviews: DetailedReview[] =
      await this.prisma.detailedReviews.findMany({
        where: { place_id: placeId },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          is_unisex: true,
          location: true,
          description: true,
          user: { select: { nickname: true } },
        },
      });

    return detailedReviews;
  }

  async getSimpleReviewsByUserId(userId: number): Promise<SimpleReview[]> {
    const simpleReviews: SimpleReview[] =
      await this.prisma.simpleReviews.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          description: true,
          stars: true,
          user: { select: { nickname: true } },
        },
      });

    return simpleReviews;
  }

  async getDetailedReviewsByUserId(userId: number): Promise<DetailedReview[]> {
    const detailedReviews: DetailedReview[] =
      await this.prisma.detailedReviews.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          is_unisex: true,
          location: true,
          description: true,
          user: { select: { nickname: true } },
        },
      });

    return detailedReviews;
  }

  async createDetailedReview(
    createDetailedReviewDto: CreateDetailedReviewDto,
  ): Promise<void> {
    const { userId, placeId, isUnisex, ...rest } = createDetailedReviewDto;

    await this.checkUserExists(userId);
    await this.checkPlaceExists(placeId);
    await this.prisma.detailedReviews.create({
      data: {
        user_id: userId,
        place_id: placeId,
        is_unisex: isUnisex,
        ...rest,
      },
    });
  }

  async updateDetailedReview(
    updateDetailedReviewDto: UpdateDetailedReviewDto,
  ): Promise<void> {
    const { userId, placeId, reviewId, description, isUnisex, location } =
      updateDetailedReviewDto;

    await this.checkUserExists(userId);

    const isAuthorship: boolean = await this.checkDetailedReviewAuthorship({
      reviewId,
      placeId,
      userId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 수정 가능합니다.`);
    }

    await this.prisma.detailedReviews.update({
      where: { id: reviewId },
      data: { description, is_unisex: isUnisex, location },
    });
  }

  private async checkDetailedReviewAuthorship({
    reviewId,
    placeId,
    userId,
  }): Promise<boolean> {
    const detailedReview: DetailedReviews =
      await this.prisma.detailedReviews.findFirst({
        where: { id: reviewId, place_id: placeId },
      });

    if (!detailedReview) {
      throw new NotFoundException(`해당 리뷰가 존재하지 않습니다.`);
    }

    return detailedReview.user_id === userId ? true : false;
  }

  private async checkSimpleReviewAuthorship({
    reviewId,
    placeId,
    userId,
  }): Promise<boolean> {
    const simpleReview: SimpleReviews =
      await this.prisma.simpleReviews.findFirst({
        where: { id: reviewId, place_id: placeId },
      });

    if (!simpleReview) {
      throw new NotFoundException(`해당 리뷰가 존재하지 않습니다.`);
    }

    return simpleReview.user_id === userId ? true : false;
  }

  async deleteDetailedReview({
    userId,
    reviewId,
    placeId,
  }: DeleteReviewDto): Promise<void> {
    await this.checkUserExists(userId);

    const isAuthorship: boolean = await this.checkDetailedReviewAuthorship({
      userId,
      reviewId,
      placeId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 삭제 가능합니다.`);
    }

    await this.prisma.detailedReviews.delete({ where: { id: reviewId } });
  }
}
