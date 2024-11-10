import { Query, Resolver } from '@nestjs/graphql';
import { CurrentClient } from 'src/common/decorators';
import { Client } from 'src/generated/graphql';

import { ClientService } from './client.service';

@Resolver(() => Client)
export class ClientResolver {
  constructor(private readonly service: ClientService) {}

  @Query(() => Client)
  clientInfo(@CurrentClient({ required: true }) client: Client) {
    return this.service.getClientInfo(client);
  }
}
