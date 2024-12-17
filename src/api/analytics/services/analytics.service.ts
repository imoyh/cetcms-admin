import { Injectable, Logger } from '@nestjs/common';
import { LogsService } from 'src/common/services';

import { ActionUsageStatistics } from '../entities';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly logsService: LogsService) {}

  async findActionUsageStatistics(from: Date, to: Date) {
    // 定义结果集
    const result: Map<string, number> = new Map();

    // 查询系统日志记录
    const records = await this.logsService.findByDateRangeOfGroup(
      ActionUsageStatistics.name,
      new Date(from),
      new Date(to),
    );

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
