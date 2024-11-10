import { Module } from '@nestjs/common';

import { ClientResolver } from './client.resolver';
import { ClientService } from './client.service';

@Module({
  providers: [ClientResolver, ClientService],
})
export class ClientModule {}
