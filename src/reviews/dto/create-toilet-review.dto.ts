import { LocationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateToiletReviewDto {
  @IsNumber()
  @IsNotEmpty()
  stars: number;

  @IsBoolean()
  @IsOptional()
  isUnisex: boolean;

  @IsEnum(LocationType)
  @IsOptional()
  location: LocationType;

  @IsString()
  @IsOptional()
  description: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  visitedAt: Date;
}
