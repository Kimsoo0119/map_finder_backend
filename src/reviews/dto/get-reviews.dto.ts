import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetReviewsDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  placeId: number;
}
