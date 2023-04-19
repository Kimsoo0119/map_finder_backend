import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateSimpleReviewDto } from './dto/update-simple-review.dto';
import { DeleteReviewDto } from './dto/delete-reveiw-dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSimpleReviews(placeId: number) {
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
  }

  async createSimpleReview(createReviewDto: CreateReviewDto): Promise<void> {
    const { userId, placeId } = createReviewDto;

    await this.checkUserExists(userId);
    await this.checkPlaceExists(placeId);
    await this.prisma.simpleReviews.create({ data: createReviewDto });
  }

  private async checkUserExists(userId: number): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`존재하지 않는 유저입니다.`);
    }
  }

  private async checkPlaceExists(placeId: number): Promise<void> {
    const place = await this.prisma.places.findUnique({
      where: {
        id: placeId,
      },
    });

    if (!place) {
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
}
