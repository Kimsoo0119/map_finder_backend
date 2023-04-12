import { Body, Controller, Get, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { GetReviewsDto } from './dto/get-reviews.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get('/simple')
  async getSimpleReviews(@Query() { placeId }: GetReviewsDto) {
    const reviews = await this.reviewsService.getSimpleReviews(placeId);

    return reviews;
  }
}
