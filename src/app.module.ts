import { Module } from '@nestjs/common';

import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [ConfigModule, UtilsModule, PrismaModule, ApiModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
