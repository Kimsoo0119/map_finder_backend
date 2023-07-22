import { Emoji } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EmojiCountUpdateType } from 'src/common/enum/review.enum';

export class EmojiDto {
  @IsEnum(Emoji, { message: '유효하지 않은 emoji입니다.' })
  @IsNotEmpty()
  emoji: Emoji;
}
