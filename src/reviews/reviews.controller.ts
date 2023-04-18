import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateSimpleReviewDto } from './dto/update-simple-review.dto';
import { DeleteReviewDto } from './dto/delete-reveiw-dto';

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

  @Patch('/simple')
  async updateSimpleReview(
    @Body() updateSimpleReviewDto: UpdateSimpleReviewDto,
  ) {
    try {
      await this.reviewsService.updateSimpleReview(updateSimpleReviewDto);

      return { message: '리뷰 수정 성공' };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/simple')
  async deleteSimpleReview(@Body() deleteSimpleReviewDto: DeleteReviewDto) {
    try {
      await this.reviewsService.deleteSimpleReview(deleteSimpleReviewDto);

      return { message: '리뷰 삭제 성공' };
    } catch (error) {
      throw error;
    }
  }
}
