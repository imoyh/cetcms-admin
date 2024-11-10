import { Injectable } from '@nestjs/common';
import { Client } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}
  async getClientInfo(client: Client) {
    const clientMenu = await this.prisma.clientMenu.findFirst({
      where: {
        clientId: client.id,
      },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
    client.menus = [clientMenu];
    return client;
  }
}
