import {
  Body,
  Controller,
  Post,
  Delete,
  UseGuards,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { GetAuthorizedUser } from 'src/common/decorator/get-user.decorator';
import { Users } from '@prisma/client';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { CreateToiletReviewReportDto } from './dto/create-toilet-review-report.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('/user')
  @UseGuards(AccessTokenGuard)
  async createUserReport(
    @GetAuthorizedUser() user: Users,
    @Body() createUserReportDto: CreateUserReportDto,
  ) {
    await this.reportService.createUserReport(user.id, createUserReportDto);

    return { status: 'success', message: '유저 신고 완료' };
  }

  @Delete('/user/:reportId')
  @UseGuards(AccessTokenGuard)
  async deleteUserReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @GetAuthorizedUser() user: Users,
  ) {
    await this.reportService.deleteUserReport(user.id, reportId);

    return { status: 'success', message: '유저 신고 내역 삭제 완료' };
  }

  @Post('/toilet-review')
  @UseGuards(AccessTokenGuard)
  async createToiletReviewReport(
    @GetAuthorizedUser() user: Users,
    @Body() createToiletReviewReportDto: CreateToiletReviewReportDto,
  ) {
    await this.reportService.createToiletReviewReport(
      user.id,
      createToiletReviewReportDto,
    );

    return { status: 'success', message: '리뷰 신고 완료' };
  }
}
