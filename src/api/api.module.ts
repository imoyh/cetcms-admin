import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [AuthModule, ClientModule, MediaModule],
})
export class ApiModule {}
