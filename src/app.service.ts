import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from 'src/config';
import { HostUtil } from 'src/utils/features';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private config: typeof AppConfiguration;
  private app: INestApplication;

  constructor(
    private readonly configService: ConfigService,
    private readonly hostProvider: HostUtil,
  ) {
    this.config = this.configService.get<typeof AppConfiguration>('app');
  }

  async start(app: INestApplication) {
    this.app = app;

    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      req.app.set('instance', this.app);
      next();
    });

    await this.app.listen(this.config.port, this.config.host);
    this.logger.log(`Application is running on: ${this.config.environment}`);
    this.logger.log(`- Local:   ${await this.getAppUrl(true)}`);
    this.logger.log(`- Network: ${await this.getAppUrl()}`);
  }

  async getAppUrl(localhost = false) {
    const url = await this.app.getUrl();
    const host = this.config.host || this.hostProvider.getIpAddress();
    return url.replace('[::1]', localhost ? '127.0.0.1' : host);
  }

  getApp() {
    return this.app;
  }
}
