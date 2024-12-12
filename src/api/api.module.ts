import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { LogsModule } from './logs/logs.module';
import { MediaModule } from './media/media.module';
import { PermissionModule } from './permission/permission.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    ClientModule,
    MediaModule,
    AdminModule,
    UserModule,
    PermissionModule,
    AnalyticsModule,
    LogsModule,
  ],
})
export class ApiModule {}
