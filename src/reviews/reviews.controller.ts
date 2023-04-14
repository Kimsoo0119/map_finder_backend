import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get('/simple')
  async getSimpleReviews(@Query() { placeId }: GetReviewsDto) {
    try {
      const reviews = await this.reviewsService.getSimpleReviews(placeId);

      return reviews;
    } catch (error) {
      throw error;
    }
  }

  @Post('/simple')
  async createSimpleReview(@Body() createReviewDto: CreateReviewDto) {
    try {
      await this.reviewsService.createSimpleReview(createReviewDto);

      return { message: '리뷰 작성 성공' };
    } catch (error) {
      throw error;
    }
  }
}
