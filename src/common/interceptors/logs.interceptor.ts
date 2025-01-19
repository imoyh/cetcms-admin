import { CallHandler, ExecutionContext, INestApplication, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { ActionUsageStatistics } from 'src/api/analytics/entities';
import { LogsService } from 'src/common/services';
import { getRequest } from 'src/helpers';

/**
 * 日志拦截器
 * 用于追踪和记录所有路由的访问统计信息
 */
@Injectable()
export class LogsInterceptor implements NestInterceptor {
  // 存储路由访问次数的映射
  private mapping: Map<string, number> = new Map();
  private readonly logger = new Logger(LogsInterceptor.name);

  /**
   * 拦截请求并处理日志记录
   * @param ctx 执行上下文
   * @param next 后续处理器
   */
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = getRequest(ctx);
      const service = this.getLogsService(request);
      const route = this.buildRoutePath(ctx, request);

      this.updateRouteCount(route);
      this.saveStatisticsIfNeeded(service);

      return next.handle().pipe(
        catchError((error) => {
          this.logger.error(`Error processing route ${route}: ${error.message}`);
          throw error;
        }),
      );
    } catch (error) {
      this.logger.error(`Interceptor error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从请求中获取日志服务实例
   */
  private getLogsService(request: any): LogsService {
    const app: INestApplication = request.app.get('instance');
    return app.get(LogsService);
  }

  /**
   * 构建路由路径标识
   * 针对 HTTP 和 GraphQL 请求构建不同格式的路径
   */
  private buildRoutePath(ctx: ExecutionContext, request: any): string {
    const type = ctx.getType();
    const resource = ctx.getClass().name;
    const action = ctx.getHandler().name;

    const paths =
      type === 'http' ? [request.method, resource, action, request.route.path] : ['GRAPHQL', resource, action];

    return paths.join('|');
  }

  /**
   * 更新路由访问计数
   */
  private updateRouteCount(route: string): void {
    const currentCount = this.mapping.get(route) ?? 0;
    this.mapping.set(route, currentCount + 1);
    this.logger.debug(`Route: ${route}, Count: ${currentCount + 1}`);
  }

  /**
   * 根据需要保存统计数据
   * 当统计数据保存成功后，清空当前映射
   */
  private saveStatisticsIfNeeded(service: LogsService): void {
    if (service.saveMappingByMinuteInterval(ActionUsageStatistics.name, this.mapping)) {
      this.mapping.clear();
    }
  }
}
