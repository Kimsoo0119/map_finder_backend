import { LocationType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDetailedReviewDto {
  @IsNumber()
  @IsNotEmpty()
  placeId: number;

  @IsNumber()
  @IsNotEmpty()
  reviewId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsBoolean()
  @IsOptional()
  isUnisex: boolean;

  @IsEnum(LocationType)
  @IsOptional()
  location: LocationType;

  @IsString()
  @IsOptional()
  description: string;
}
