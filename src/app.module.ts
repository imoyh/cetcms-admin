import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ApiModule } from 'src/api/api.module';
import { ConfigModule } from 'src/config/config.module';
import { UtilsModule } from 'src/utils/utils.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ApiModule, ConfigModule, UtilsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
