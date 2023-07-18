import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { GetToiletReviewsDto } from './dto/get-toilet-reviews.dto';
import { DeleteToiletReviewDto } from './dto/delete-toilet-reveiw-dto';
import { ToiletReview } from './interface/reviews.interface';
import { CreateToiletReviewDto } from './dto/create-toilet-review.dto';
import { UpdateToiletReviewDto } from './dto/update-toilet-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/toilet')
  async getToiletReviews(
    @Query() { placeId }: GetToiletReviewsDto,
  ): Promise<ToiletReview[]> {
    const ToiletReviews: ToiletReview[] =
      await this.reviewsService.getToiletReviews(placeId);

    return ToiletReviews;
  }

  @Get('/toilet/:userId')
  async getToiletReviewsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ToiletReview[]> {
    const ToiletReviews: ToiletReview[] =
      await this.reviewsService.getToiletReviewsByUserId(userId);

    return ToiletReviews;
  }

  @Post('/toilet')
  async createToiletReview(
    @Body() createToiletReviewDto: CreateToiletReviewDto,
  ) {
    await this.reviewsService.createToiletReview(createToiletReviewDto);

    return { message: '리뷰 작성 완료' };
  }

  @Patch('/toilet')
  async updateToiletReview(
    @Body() updateToiletReviewDto: UpdateToiletReviewDto,
  ) {
    await this.reviewsService.updateToiletReview(updateToiletReviewDto);

    return { message: '리뷰 수정 완료' };
  }

  @Delete('/toilet')
  async deleteToiletReview(
    @Body() deleteToiletReviewDto: DeleteToiletReviewDto,
  ) {
    await this.reviewsService.deleteToiletReview(deleteToiletReviewDto);

    return { message: '리뷰 삭제 완료' };
  }
}
