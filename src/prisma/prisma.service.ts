import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { PrismaDataHeaderMiddleware } from './middlewares';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.$use(PrismaDataHeaderMiddleware);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
