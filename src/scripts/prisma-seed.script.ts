import * as process from 'process';

import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasicSeed } from 'src/prisma/seeds/basic.seed';

@Injectable()
export class PrismaSeedScript {
  private readonly logger = new Logger(PrismaSeedScript.name);
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    await BasicSeed(this.prisma);
    this.logger.log('Seeding completed successfully');
  }
}
// This is the entry point of the application
async function bootstrap() {
  const logger = new Logger(PrismaSeedScript.name);
  const app = await NestFactory.create(AppModule);
  const service = app.get(PrismaService);
  const script = new PrismaSeedScript(service);
  script.run().then(() => {
    logger.log('Running in external script mode');
    process.exit(0);
  });
}

if (require.main === module) {
  bootstrap().then();
}
