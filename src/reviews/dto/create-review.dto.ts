import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  placeId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  stars: number;

  @IsOptional()
  description: string;
}
