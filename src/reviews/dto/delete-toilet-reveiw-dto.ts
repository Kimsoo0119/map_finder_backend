import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteToiletReviewDto {
  @IsNumber()
  @IsNotEmpty()
  reviewId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  placeId: number;
}
