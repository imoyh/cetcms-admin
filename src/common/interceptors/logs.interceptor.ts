import { CallHandler, ExecutionContext, INestApplication, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActionUsageStatistics } from 'src/api/analytics/entities';
import { LogsService } from 'src/common/services';
import { getRequest } from 'src/helpers';

@Injectable()
export class LogsInterceptor implements NestInterceptor {
  private mapping: Map<string, number> = new Map();
  private readonly logger = new Logger(LogsInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const request = getRequest(ctx);
    const app: INestApplication = request.app.get('instance');
    const service: LogsService = app.get(LogsService);

    const type = ctx.getType();
    const resource = ctx.getClass().name;
    const action = ctx.getHandler().name;

    const isHttp = type === 'http';
    const paths = isHttp ? [request.method] : ['GRAPHQL'];
    paths.push(resource, action);
    if (isHttp) paths.push(request.route.path);

    const route = paths.join('|');
    const count = this.mapping.get(route) || 0;

    this.mapping.set(route, count + 1);
    this.logger.log(`Route: ${route}, Count: ${this.mapping.get(route)}`);
    if (service.saveMappingByMinuteInterval(ActionUsageStatistics.name, this.mapping)) {
      this.mapping.clear();
    }

    return next.handle();
  }
}
