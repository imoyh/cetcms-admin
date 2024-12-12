import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActionUsageStatistics } from 'src/api/analytics/entities';
import { LogsService } from 'src/common/services';

@Injectable()
export class LogsInterceptor implements NestInterceptor {
  private mapping: Map<string, number> = new Map();
  private readonly logger = new Logger(LogsInterceptor.name);

  constructor(private readonly service: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const resource = context.getClass().name;
    const action = context.getHandler().name;
    const route = `${resource}:${action}`;
    const count = this.mapping.get(route) || 0;
    this.mapping.set(route, count + 1);
    this.logger.log(`Route: ${route}, Count: ${this.mapping.get(route)}`);
    if (this.service.saveMappingByMinuteInterval(ActionUsageStatistics.name, this.mapping)) {
      this.mapping.clear();
    }
    return next.handle();
  }
}
