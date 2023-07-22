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
import { EmojiLog, ToiletReview } from './interface/reviews.interface';
import { CreateToiletReviewDto } from './dto/create-toilet-review.dto';
import { UpdateToiletReviewDto } from './dto/update-toilet-review.dto';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { GetAuthorizedUser } from 'src/common/decorator/get-user.decorator';
import { Users } from '@prisma/client';
import { EmojiDto } from './dto/emoji.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/place/:placeId/toilet')
  async getPlaceToiletReviews(
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<ToiletReview[]> {
    const ToiletReviews: ToiletReview[] =
      await this.reviewsService.getToiletReviewsByPlaceId(placeId);

    return ToiletReviews;
  }

  @Post('/place/:placeId/toilet')
  @UseGuards(AccessTokenGuard)
  async createToiletReview(
    @GetAuthorizedUser() user: Users,
    @Param('placeId', ParseIntPipe) placeId: number,
    @Body() createToiletReviewDto: CreateToiletReviewDto,
  ) {
    await this.reviewsService.createToiletReview(
      user.id,
      placeId,
      createToiletReviewDto,
    );

    return { status: 'success', message: '리뷰 작성 완료' };
  }

  @Patch('/place/:placeId/toilet/:toiletReviewId')
  @UseGuards(AccessTokenGuard)
  async updateToiletReview(
    @GetAuthorizedUser() user: Users,
    @Param('placeId', ParseIntPipe) placeId: number,
    @Param('toiletReviewId', ParseIntPipe) toiletReviewId: number,
    @Body() updateToiletReviewDto: UpdateToiletReviewDto,
  ) {
    await this.reviewsService.updateToiletReview(
      user.id,
      placeId,
      toiletReviewId,
      updateToiletReviewDto,
    );

    return { status: 'success', message: '리뷰 수정 완료' };
  }

  @Delete('/place/:placeId/toilet/:toiletReviewId')
  @UseGuards(AccessTokenGuard)
  async deleteToiletReview(
    @GetAuthorizedUser() user: Users,
    @Param('placeId', ParseIntPipe) placeId: number,
    @Param('toiletReviewId', ParseIntPipe) toiletReviewId: number,
  ) {
    await this.reviewsService.deleteToiletReview(
      user.id,
      placeId,
      toiletReviewId,
    );

    return { status: 'success', message: '리뷰 삭제 완료' };
  }

  @Post('/place/toilet/:toiletReviewId/toilet-emoji')
  @UseGuards(AccessTokenGuard)
  async createToiletReviewEmoji(
    @GetAuthorizedUser() user: Users,
    @Param('toiletReviewId', ParseIntPipe) toiletReviewId: number,
    @Query() { emoji }: EmojiDto,
  ) {
    await this.reviewsService.createToiletReviewEmoji(
      user.id,
      toiletReviewId,
      emoji,
    );

    return { status: 'success' };
  }

  @Patch('/place/toilet/:toiletReviewId/toilet-emoji/:toiletReviewEmojiId')
  @UseGuards(AccessTokenGuard)
  async updateToiletReviewEmoji(
    @GetAuthorizedUser() user: Users,
    @Param('toiletReviewId', ParseIntPipe) toiletReviewId: number,
    @Param('toiletReviewEmojiId', ParseIntPipe) toiletReviewEmojiId: number,
    @Query() { emoji }: EmojiDto,
  ) {
    await this.reviewsService.updateToiletReviewEmoji(
      user.id,
      toiletReviewId,
      toiletReviewEmojiId,
      emoji,
    );

    return { status: 'success' };
  }

  @Delete('/place/toilet/:toiletReviewId/toilet-emoji/:toiletReviewEmojiId')
  @UseGuards(AccessTokenGuard)
  async deleteToiletReviewEmoji(
    @GetAuthorizedUser() user: Users,
    @Param('toiletReviewId', ParseIntPipe) toiletReviewId: number,
    @Param('toiletReviewEmojiId', ParseIntPipe) toiletReviewEmojiId: number,
  ) {
    await this.reviewsService.deleteToiletReviewEmoji(
      user.id,
      toiletReviewId,
      toiletReviewEmojiId,
    );

    return { status: 'success' };
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

  @Get('/user/toilet-emoji')
  @UseGuards(AccessTokenGuard)
  async getUsersToiletReviewsEmoji(@GetAuthorizedUser() user: Users) {
    const emojiLog: EmojiLog[] =
      await this.reviewsService.getUsersToiletReviewEmojiLog(user);

    return { emojiLog };
  }
}
