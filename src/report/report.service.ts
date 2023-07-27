import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { CreateToiletReviewReportDto } from './dto/create-toilet-review-report.dto';
import { ReportType, Reports } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}
  async getReports(userId: number): Promise<Reports[]> {
    return await this.prisma.reports.findMany({
      where: { reporter_id: userId },
    });
  }

  async createUserReport(
    userId: number,
    createUserReportDto: CreateUserReportDto,
  ): Promise<void> {
    const { targetUserId, reportType, reason, description } =
      createUserReportDto;
    if (reportType !== ReportType.USER) {
      throw new BadRequestException(`잘못된 요청입니다.`);
    }

    const targetUserExist = await this.prisma.users.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUserExist) {
      throw new NotFoundException(`존재하지 않는 유저입니다.`);
    }
    if (targetUserExist.id === userId) {
      throw new BadRequestException(`타인만 신고 가능합니다.`);
    }

    await this.prisma.reports.create({
      data: {
        reporter_id: userId,
        target_user_id: targetUserId,
        report_type: reportType,
        reason,
        description,
      },
    });
  }

  async deleteReport(userId: number, reportId: number): Promise<void> {
    const isAuthorship: boolean = await this.checkReportAuthorship(
      userId,
      reportId,
    );
    if (!isAuthorship) {
      throw new BadRequestException(`작성자만 삭제 가능합니다.`);
    }

    await this.prisma.reports.delete({ where: { id: reportId } });
  }

  private async checkReportAuthorship(
    userId: number,
    reportId: number,
  ): Promise<boolean> {
    const report = await this.prisma.reports.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException(`신고내역이 존재하지 않습니다.`);
    }
    return report.reporter_id === userId ? true : false;
  }

  async createToiletReviewReport(
    userId: number,
    createToiletReviewReportDto: CreateToiletReviewReportDto,
  ): Promise<void> {
    const { targetToiletReviewId, reportType, reason, description } =
      createToiletReviewReportDto;
    if (reportType !== ReportType.TOILET_REVIEW) {
      throw new BadRequestException(`잘못된 요청입니다.`);
    }

    const targetToiletReviewExist = await this.prisma.toiletReviews.findUnique({
      where: { id: targetToiletReviewId },
    });
    if (!targetToiletReviewExist) {
      throw new NotFoundException(`존재하지 않는 리뷰입니다.`);
    }
    if (targetToiletReviewExist.id === userId) {
      throw new BadRequestException(`타인만 신고 가능합니다.`);
    }

    await this.prisma.reports.create({
      data: {
        reporter_id: userId,
        target_toilet_review_id: targetToiletReviewId,
        report_type: reportType,
        reason,
        description,
      },
    });
  }
}
