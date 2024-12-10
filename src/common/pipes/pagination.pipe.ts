import { Injectable, PipeTransform } from '@nestjs/common';
import { PaginationArgs } from 'src/common/dto';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(args: PaginationArgs) {
    args.page = Math.abs(args.page || 1);
    args.limit = Math.abs(args.limit || 10);
    return args;
  }
}
