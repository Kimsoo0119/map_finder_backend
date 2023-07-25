import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmojiLog, ToiletReview } from './interface/reviews.interface';
import { Emoji, ToiletReviews, Users } from '@prisma/client';
import { CreateToiletReviewDto } from './dto/create-toilet-review.dto';
import { UpdateToiletReviewDto } from './dto/update-toilet-review.dto';
import { ConfigService } from '@nestjs/config';
import { EmojiCountUpdateType } from 'src/common/enum/review.enum';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async getToiletReviewsByPlaceId(placeId: number): Promise<ToiletReview[]> {
    const toiletReviews: ToiletReview[] =
      await this.prisma.toiletReviews.findMany({
        where: { place_id: placeId },
        select: {
          id: true,
          place_id: true,
          stars: true,
          created_at: true,
          updated_at: true,
          is_unisex: true,
          location: true,
          description: true,
          visited_at: true,
          like_count: true,
          sad_count: true,
          smile_count: true,
          helpful_count: true,
          user: { select: { id: true, nickname: true } },
        },
      });

    return toiletReviews;
  }

  async getToiletReviewsByUserId(userId: number): Promise<ToiletReview[]> {
    const toiletReviews: ToiletReview[] =
      await this.prisma.toiletReviews.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          place_id: true,
          stars: true,
          is_unisex: true,
          location: true,
          visited_at: true,
          description: true,
          created_at: true,
          updated_at: true,
          like_count: true,
          sad_count: true,
          smile_count: true,
          helpful_count: true,
          user: { select: { id: true, nickname: true } },
        },
      });

    return toiletReviews;
  }

  async createToiletReview(
    userId: number,
    placeId: number,
    createToiletReviewDto: CreateToiletReviewDto,
  ): Promise<void> {
    const { isUnisex, visitedAt, ...rest } = createToiletReviewDto;

    const placeExists = await this.prisma.places.findUnique({
      where: {
        id: placeId,
      },
    });
    if (!placeExists) {
      throw new BadRequestException(`해당 가게가 존재하지 않습니다.`);
    }

    await this.prisma.toiletReviews.create({
      data: {
        user_id: userId,
        place_id: placeId,
        is_unisex: isUnisex,
        visited_at: visitedAt,
        ...rest,
      },
    });
  }

  async updateToiletReview(
    userId: number,
    placeId: number,
    toiletReviewId: number,
    updateToiletReviewDto: UpdateToiletReviewDto,
  ): Promise<void> {
    const { isUnisex, visitedAt, ...rest } = updateToiletReviewDto;

    const isAuthorship: boolean = await this.checkToiletReviewAuthorship({
      toiletReviewId,
      placeId,
      userId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 수정 가능합니다.`);
    }

    await this.prisma.toiletReviews.update({
      where: { id: toiletReviewId },
      data: { is_unisex: isUnisex, visited_at: visitedAt, ...rest },
    });
  }

  private async checkToiletReviewAuthorship({
    userId,
    placeId,
    toiletReviewId,
  }): Promise<boolean> {
    const toiletReview: ToiletReviews =
      await this.prisma.toiletReviews.findFirst({
        where: { id: toiletReviewId, place_id: placeId },
      });

    if (!toiletReview) {
      throw new NotFoundException(`해당 리뷰가 존재하지 않습니다.`);
    }

    return toiletReview.user_id === userId ? true : false;
  }

  async deleteToiletReview(
    userId: number,
    placeId: number,
    toiletReviewId: number,
  ): Promise<void> {
    const isAuthorship: boolean = await this.checkToiletReviewAuthorship({
      userId,
      placeId,
      toiletReviewId,
    });
    if (!isAuthorship) {
      throw new BadRequestException(`리뷰 작성자만 삭제 가능합니다.`);
    }

    await this.prisma.toiletReviews.delete({ where: { id: toiletReviewId } });
  }

  async createToiletReviewEmoji(
    userId: number,
    toiletReviewId: number,
    emoji: Emoji,
  ) {
    const toiletReview: ToiletReviews =
      await this.prisma.toiletReviews.findUnique({
        where: { id: toiletReviewId },
      });

    if (!toiletReview) {
      throw new NotFoundException(`리뷰가 존재하지 않습니다.`);
    }
    await this.prisma.$transaction(async (prisma) => {
      await prisma.toiletReviewEmoji.create({
        data: { user_id: userId, toilet_review_id: toiletReviewId, emoji },
      });

      await this.updateToiletReviewEmojiCount(
        toiletReviewId,
        emoji,
        EmojiCountUpdateType.INCREASE,
        prisma,
      );
    });
  }

  private async updateToiletReviewEmojiCount(
    toiletReviewId: number,
    emoji: Emoji,
    emojiCountUpdateType: EmojiCountUpdateType,
    prisma,
  ) {
    const fieldToUpdate = `${emoji.toLocaleLowerCase()}_count`;
    const incrementValue =
      emojiCountUpdateType === EmojiCountUpdateType.INCREASE ? 1 : -1;

    await prisma.toiletReviews.update({
      where: { id: toiletReviewId },
      data: { [fieldToUpdate]: { increment: incrementValue } },
    });
  }

  async getUsersToiletReviewEmojiLog(user: Users): Promise<EmojiLog[]> {
    const emojiLog: EmojiLog[] = await this.prisma.toiletReviewEmoji.findMany({
      where: { user_id: user.id },
      select: {
        id: true,
        emoji: true,
        toilet_reviews: true,
      },
    });

    return emojiLog;
  }

  async updateToiletReviewEmoji(
    userId: number,
    toiletReviewId: number,
    toiletReviewEmojiId: number,
    emoji: Emoji,
  ) {
    const writtenToiletEmoji = await this.getWrittenToiletEmoji(
      userId,
      toiletReviewEmojiId,
    );
    if (writtenToiletEmoji === emoji) {
      return;
    }

    const emojiFieldToDecrease = `${writtenToiletEmoji.toLocaleLowerCase()}_count`;
    const emojiFieldToIncrease = `${emoji.toLocaleLowerCase()}_count`;

    await this.prisma.$transaction(async (prisma) => {
      await prisma.toiletReviewEmoji.update({
        where: { id: toiletReviewEmojiId },
        data: { emoji },
      });

      await prisma.toiletReviews.update({
        where: { id: toiletReviewId },
        data: {
          [emojiFieldToDecrease]: { increment: -1 },
          [emojiFieldToIncrease]: { increment: 1 },
        },
      });
    });
  }

  private async getWrittenToiletEmoji(userId, toiletReviewEmojiId) {
    const emojiLog = await this.prisma.toiletReviewEmoji.findUnique({
      where: {
        id: toiletReviewEmojiId,
      },
    });

    if (!emojiLog) {
      throw new NotFoundException(`이모지 내역이 존재하지 않습니다.`);
    }
    if (emojiLog.user_id !== userId) {
      throw new BadRequestException(`작성자만 조회 가능합니다.`);
    }

    return emojiLog.emoji;
  }

  async deleteToiletReviewEmoji(
    userId: number,
    toiletReviewId: number,
    toiletReviewEmojiId: number,
  ) {
    const toiletReview: ToiletReviews =
      await this.prisma.toiletReviews.findUnique({
        where: { id: toiletReviewId },
      });

    if (!toiletReview) {
      throw new NotFoundException(`리뷰가 존재하지 않습니다.`);
    }

    const emojiFieldToDecrease = await this.getWrittenToiletEmoji(
      userId,
      toiletReviewEmojiId,
    );

    await this.prisma.$transaction(async (prisma) => {
      await prisma.toiletReviewEmoji.delete({
        where: { id: toiletReviewEmojiId },
      });

      await this.updateToiletReviewEmojiCount(
        toiletReviewId,
        emojiFieldToDecrease,
        EmojiCountUpdateType.DECREASE,
        prisma,
      );
    });
  }
}
