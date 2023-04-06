import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createNaverReview(reviews) {
    await this.prisma.review.createMany({
      data: reviews.map((review) => ({
        description: review.description,
      })),
    });
    // await this.prisma.naverReview.create
  }
}
