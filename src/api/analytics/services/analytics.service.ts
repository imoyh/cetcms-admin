import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma/prisma.service';

import { ActionUsageStatistics } from '../entities';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findActionUsageStatistics(from: Date, to: Date) {
    // 定义结果集
    const result: Map<string, number> = new Map();

    // 转换日期格式
    const startDate = dayjs(new Date(from).toUTCString());
    const endDate = dayjs(new Date(to).toUTCString());

    // 查询系统日志记录
    const records = await this.prisma.systemLogRecord.findMany({
      where: {
        group: ActionUsageStatistics.name,
        recordAt: {
          lt: endDate.toDate(),
          gte: startDate.toDate(),
        },
      },
    });
    // 遍历记录
    await Promise.all(
      records.map(async (record) => {
        const data = record.content as Array<[string, number]>;
        for (const [key, value] of data) {
          result.set(key, (result.get(key) || 0) + value);
        }
      }),
    );

    // 转换结果集为数组
    return Array.from(result.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }
}
