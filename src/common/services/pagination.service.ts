import { Injectable } from '@nestjs/common';
import { IPagination, PaginationArgs } from 'src/common/dto';

@Injectable()
export class PaginationService {
  output(count: number, args: PaginationArgs): IPagination {
    return {
      page: Math.abs(args.page),
      limit: Math.abs(args.limit),
      totalCount: count,
      totalPages: Math.ceil(count / Math.abs(args.limit)),
    };
  }
}
