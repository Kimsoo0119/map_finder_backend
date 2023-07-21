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
import { EmojiLog, ToiletReview } from './interface/reviews.interface';
import { CreateToiletReviewDto } from './dto/create-toilet-review.dto';
import { UpdateToiletReviewDto } from './dto/update-toilet-review.dto';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { GetAuthorizedUser } from 'src/common/decorator/get-user.decorator';
import { Users, Emoji } from '@prisma/client';
import { UpdateEmojiDto } from './dto/emoji.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/place/toilet')
  async getPlaceToiletReviews(
    @Query() { placeId }: GetToiletReviewsDto,
  ): Promise<ToiletReview[]> {
    const ToiletReviews: ToiletReview[] =
      await this.reviewsService.getToiletReviewsByPlaceId(placeId);

    return ToiletReviews;
  }

  @Get('/user/toilet')
  @UseGuards(AccessTokenGuard)
  async getUsersToiletReviews(
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

    return { status: 'success', message: '리뷰 작성 완료' };
  }

  @Patch('/toilet')
  async updateToiletReview(
    @Body() updateToiletReviewDto: UpdateToiletReviewDto,
  ) {
    await this.reviewsService.updateToiletReview(updateToiletReviewDto);

    return { status: 'success', message: '리뷰 수정 완료' };
  }

  @Delete('/toilet')
  async deleteToiletReview(
    @Body() deleteToiletReviewDto: DeleteToiletReviewDto,
  ) {
    await this.reviewsService.deleteToiletReview(deleteToiletReviewDto);

    return { status: 'success', message: '리뷰 삭제 완료' };
  }

  @Get('/user/toilet/emoji')
  @UseGuards(AccessTokenGuard)
  async getUsersToiletReviewsEmoji(@GetAuthorizedUser() user: Users) {
    const emojiLog: EmojiLog[] =
      await this.reviewsService.getUsersToiletReviewEmojiLog(user);

    return { emojiLog };
  }

  @Post('/toilet/:toiletReviewId')
  @UseGuards(AccessTokenGuard)
  async createToiletReviewEmoji(
    @GetAuthorizedUser() user: Users,
    @Param('toiletReviewId', ParseIntPipe) toiletReviewId: number,
    @Query() { emoji }: UpdateEmojiDto,
  ) {
    await this.reviewsService.createToiletReviewEmoji(
      user.id,
      toiletReviewId,
      emoji,
    );
    return { status: 'success' };
  }
}
