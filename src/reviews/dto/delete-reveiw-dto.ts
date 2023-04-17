import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteReviewDto {
  @IsNumber()
  @IsNotEmpty()
  reviewId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
