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
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { GetToiletReviewsDto } from './dto/get-toilet-reviews.dto';
import { DeleteToiletReviewDto } from './dto/delete-toilet-reveiw-dto';
import { ToiletReview } from './interface/reviews.interface';
import { CreateToiletReviewDto } from './dto/create-toilet-review.dto';
import { UpdateToiletReviewDto } from './dto/update-toilet-review.dto';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { GetAuthorizedUser } from 'src/common/decorator/get-user.decorator';
import { Users } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/toilet/place')
  async getToiletReviewsByPlaceId(
    @Query() { placeId }: GetToiletReviewsDto,
  ): Promise<ToiletReview[]> {
    const ToiletReviews: ToiletReview[] =
      await this.reviewsService.getToiletReviewsByPlaceId(placeId);

    return ToiletReviews;
  }

  @Get('/toilet/user')
  @UseGuards(AccessTokenGuard)
  async getToiletReviewsByUserId(
    @GetAuthorizedUser() user: Users,
  ): Promise<ToiletReview[]> {
    const ToiletReviews: ToiletReview[] =
      await this.reviewsService.getToiletReviewsByUserId(user.id);

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
