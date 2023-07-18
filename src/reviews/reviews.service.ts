import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteToiletReviewDto } from './dto/delete-toilet-reveiw-dto';
import { ToiletReview } from './interface/reviews.interface';
import { Places, ToiletReviews, Users } from '@prisma/client';
import { CreateToiletReviewDto } from './dto/create-toilet-review.dto';
import { UpdateToiletReviewDto } from './dto/update-toilet-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}
  async getToiletReviews(placeId: number) {
    const toiletReviews: ToiletReview[] =
      await this.prisma.toiletReviews.findMany({
        where: { place_id: placeId },
        select: {
          id: true,
          stars: true,
          created_at: true,
          updated_at: true,
          is_unisex: true,
          location: true,
          description: true,
          visited_at: true,
          user: { select: { nickname: true } },
        },
      });

    return toiletReviews;
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
      throw new NotFoundException(`해당 가게가 존재하지 않습니다.`);
    }

    return selectedPlace;
  }

  async getToiletReviewsByUserId(userId: number): Promise<ToiletReview[]> {
    const toiletReviews: ToiletReview[] =
      await this.prisma.toiletReviews.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          stars: true,
          created_at: true,
          updated_at: true,
          is_unisex: true,
          location: true,
          description: true,
          visited_at: true,
          user: { select: { nickname: true } },
        },
      });

    return toiletReviews;
  }

  async createToiletReview(
    createToiletReviewDto: CreateToiletReviewDto,
  ): Promise<void> {
    const { userId, placeId, isUnisex, visitedAt, ...rest } =
      createToiletReviewDto;

    await this.checkUserExists(userId);
    await this.checkPlaceExists(placeId);
    await this.prisma.toiletReviews.create({
      data: {
        user_id: userId,
        place_id: placeId,
        is_unisex: isUnisex,
        visited_at: visitedAt,
        ...rest,
      },
    });
  }

  async updateToiletReview(
    updateToiletReviewDto: UpdateToiletReviewDto,
  ): Promise<void> {
    const { userId, placeId, reviewId, isUnisex, visitedAt, ...rest } =
      updateToiletReviewDto;

    await this.checkUserExists(userId);

    const isAuthorship: boolean = await this.checkToiletReviewAuthorship({
      reviewId,
      placeId,
      userId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 수정 가능합니다.`);
    }

    await this.prisma.toiletReviews.update({
      where: { id: reviewId },
      data: { is_unisex: isUnisex, visited_at: visitedAt, ...rest },
    });
  }

  private async checkToiletReviewAuthorship({
    reviewId,
    placeId,
    userId,
  }): Promise<boolean> {
    const toiletReview: ToiletReviews =
      await this.prisma.toiletReviews.findFirst({
        where: { id: reviewId, place_id: placeId },
      });

    if (!toiletReview) {
      throw new NotFoundException(`해당 리뷰가 존재하지 않습니다.`);
    }

    return toiletReview.user_id === userId ? true : false;
  }

  // private async checkSimpleReviewAuthorship({
  //   reviewId,
  //   placeId,
  //   userId,
  // }): Promise<boolean> {
  //   const simpleReview: SimpleReviews =
  //     await this.prisma.simpleReviews.findFirst({
  //       where: { id: reviewId, place_id: placeId },
  //     });

  //   if (!simpleReview) {
  //     throw new NotFoundException(`해당 리뷰가 존재하지 않습니다.`);
  //   }

  //   return simpleReview.user_id === userId ? true : false;
  // }

  async deleteToiletReview({
    userId,
    reviewId,
    placeId,
  }: DeleteToiletReviewDto): Promise<void> {
    await this.checkUserExists(userId);

    const isAuthorship: boolean = await this.checkToiletReviewAuthorship({
      userId,
      reviewId,
      placeId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 삭제 가능합니다.`);
    }

    await this.prisma.toiletReviews.delete({ where: { id: reviewId } });
  }
}
