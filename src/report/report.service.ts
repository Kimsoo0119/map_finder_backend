import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserReportDto } from './dto/create-user-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async createUserReport(
    userId: number,
    createUserReportDto: CreateUserReportDto,
  ) {
    const { targetUserId, reportType, reason, description } =
      createUserReportDto;

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
}
