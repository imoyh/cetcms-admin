import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, ClientModule, MediaModule, AdminModule, UserModule],
})
export class ApiModule {}
