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
import { GetReviewsDto } from './dto/get-reviews.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateSimpleReviewDto } from './dto/update-simple-review.dto';
import { DeleteReviewDto } from './dto/delete-reveiw-dto';
import { DetailedReview, SimpleReview } from './interface/reviews.interface';
import { CreateDetailedReviewDto } from './dto/create-detailed-review.dto';
import { UpdateDetailedReviewDto } from './dto/update-detailed-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get('/simple')
  async getSimpleReviews(
    @Query() { placeId }: GetReviewsDto,
  ): Promise<SimpleReview[]> {
    const reviews: SimpleReview[] = await this.reviewsService.getSimpleReviews(
      placeId,
    );

    return reviews;
  }

  @Get('/simple/:userId')
  async getSimpleReviewsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<SimpleReview[]> {
    const simpleReviews: SimpleReview[] =
      await this.reviewsService.getSimpleReviewsByUserId(userId);

    return simpleReviews;
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

  @Get('/detail')
  async getDetailedReviews(
    @Query() { placeId }: GetReviewsDto,
  ): Promise<DetailedReview[]> {
    const detailedReviews: DetailedReview[] =
      await this.reviewsService.getDetailedReviews(placeId);

    return detailedReviews;
  }

  @Get('/detail/:userId')
  async getDetailedReviewsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<DetailedReview[]> {
    const detailedReviews: DetailedReview[] =
      await this.reviewsService.getDetailedReviewsByUserId(userId);

    return detailedReviews;
  }

  @Post('/detail')
  async createDetailedReview(
    @Body() createDetailedReviewDto: CreateDetailedReviewDto,
  ) {
    await this.reviewsService.createDetailedReview(createDetailedReviewDto);

    return { message: '리뷰 작성 완료' };
  }

  @Patch('/detail')
  async updateDetailedReview(
    @Body() updateDetailedReviewDto: UpdateDetailedReviewDto,
  ) {
    await this.reviewsService.updateDetailedReview(updateDetailedReviewDto);

    return { message: '리뷰 수정 완료' };
  }

  @Delete('/detail')
  async deleteDetailedReview(@Body() deleteDetailedReviewDto: DeleteReviewDto) {
    await this.reviewsService.deleteDetailedReview(deleteDetailedReviewDto);

    return { message: '리뷰 삭제 완료' };
  }
}
