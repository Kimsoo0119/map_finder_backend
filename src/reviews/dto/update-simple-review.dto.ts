import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateSimpleReviewDto {
  @IsNumber()
  @IsNotEmpty()
  reviewId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  placeId: number;

  @IsNumber()
  @IsOptional()
  stars: number;

  @IsOptional()
  description: string;
}
