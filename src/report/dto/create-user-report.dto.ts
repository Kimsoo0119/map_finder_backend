import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Reason, ReportType } from '@prisma/client';

export class CreateUserReportDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;

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
