import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Reason, ReportType } from '@prisma/client';

export class CreateToiletReviewReportDto {
  @IsNumber()
  @IsNotEmpty()
  targetToiletReviewId: number;

  @IsEnum(ReportType)
  @IsNotEmpty()
  reportType: ReportType;

  @IsEnum(Reason)
  @IsNotEmpty()
  reason: Reason;

  @IsString()
  @IsOptional()
  description: string;
}
