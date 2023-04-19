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
    const reviews = await this.reviewsService.getSimpleReviews(placeId);

    return reviews;
  }

  @Post('/simple')
  async createSimpleReview(@Body() createReviewDto: CreateReviewDto) {
    await this.reviewsService.createSimpleReview(createReviewDto);

    return { message: '리뷰 작성 성공' };
  }

  @Patch('/simple')
  async updateSimpleReview(
    @Body() updateSimpleReviewDto: UpdateSimpleReviewDto,
  ) {
    await this.reviewsService.updateSimpleReview(updateSimpleReviewDto);

    return { message: '리뷰 수정 성공' };
  }

  @Delete('/simple')
  async deleteSimpleReview(@Body() deleteSimpleReviewDto: DeleteReviewDto) {
    await this.reviewsService.deleteSimpleReview(deleteSimpleReviewDto);

    return { message: '리뷰 삭제 성공' };
  }
}
