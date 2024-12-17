import fs from 'node:fs';
import path from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  private readonly cachePath = path.join(process.cwd(), '.cache');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save mapping to database by minute interval.
   * @param group
   * @param mapping
   * @param interval
   */
  saveMappingByMinuteInterval(group: string, mapping: Map<string, any>, interval: number = 1): boolean {
    // get current date and time
    const date = dayjs();

    // check if current minute is a multiple of interval
    if (date.minute() % interval) {
      return false;
    }

    // check if cache directory exists
    const cachePathKey = path.join(this.cachePath, date.format('YYYY-MM-DD'), date.format('HH-mm'));

    // exists cache directory for current minute interval, if not create it, save mapping to it
    if (fs.existsSync(cachePathKey)) return false;

    // create cache directory if not exists
    fs.mkdirSync(cachePathKey, { recursive: true });

    // convert mapping to array of tuples
    const recordAt = date.startOf('minute').toDate();
    const content = Array.from(mapping.entries());

    // save mapping to database
    this.prisma.systemLogRecord.create({ data: { group, recordAt, content } }).then(() => {
      this.logger.log(`Mapping saved to ${cachePathKey} at ${date.format('YYYY-MM-DD HH:mm:ss')}.`);
    });

    return true;
  }

  /**
   * Find all records by date range of group.
   * @param group
   * @param start
   * @param end
   */
  findByDateRangeOfGroup(group: string, start: Date, end: Date) {
    return this.prisma.systemLogRecord.findMany({
      where: {
        group,
        recordAt: {
          lt: start,
          gte: end,
        },
      },
    });
  }
}
