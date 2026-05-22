import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RentalStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma';

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  private async markOverdueRentals() {
    const now = new Date();
    await this.prisma.rental.updateMany({
      where: {
        status: RentalStatus.Issued,
        dueDate: { lt: now },
      },
      data: {
        status: RentalStatus.Overdue,
      },
    });
  }
}
