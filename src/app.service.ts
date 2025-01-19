import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { ExtensionsFilter } from 'src/common/filters';
import { LogsInterceptor } from 'src/common/interceptors';
import { AppConfiguration } from 'src/config';
import { HostUtil } from 'src/utils/features';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private config: typeof AppConfiguration;
  private app: INestApplication;

  constructor(
    private readonly configService: ConfigService,
    private readonly util: HostUtil,
  ) {
    this.config = this.configService.get<typeof AppConfiguration>('app')!;
  }

  async start(app: INestApplication) {
    this.app = app;

    const MAX_FILE_SIZE = 20 * 1000 ** 2;
    const MAX_FILES = 1;

    // 分开处理中间件和应用配置
    // 先处理中间件
    this.app.use(graphqlUploadExpress({ maxFileSize: MAX_FILE_SIZE, maxFiles: MAX_FILES }));
    this.app.use(this.setInstanceMiddleware.bind(this));
    // 再配置应用
    this.app.enableCors();
    this.app.useGlobalFilters(new ExtensionsFilter());
    this.app.useGlobalInterceptors(new LogsInterceptor());

    await this.app.listen(this.config.port, this.config.host);

    await this.logApplicationUrls();
  }

  async getAppUrl(localhost = false) {
    const url = await this.app.getUrl();
    const host = this.config.host || this.util.getIpAddress();
    return url.replace('[::1]', localhost ? '127.0.0.1' : host);
  }

  getApp() {
    return this.app;
  }

  private setInstanceMiddleware(req: Request, _res: Response, next: NextFunction) {
    req.app.set('instance', this.app);
    next();
  }

  private async logApplicationUrls(): Promise<void> {
    this.logger.log(`Application is running on: ${this.config.environment}`);
    this.logger.log(`- Local:   ${await this.getAppUrl(true)}`);
    this.logger.log(`- Network: ${await this.getAppUrl()}`);
  }
}
