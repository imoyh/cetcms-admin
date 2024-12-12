import * as process from 'process';

import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { chunk } from 'lodash';
import minimist from 'minimist';
import { PermissionChannelType, PermissionInfo } from 'src/api/permission/entities';
import { PermissionService } from 'src/api/permission/permission.service';
import { AppModule } from 'src/app.module';
import { AdminRole, UserRole } from 'src/generated/graphql';
import { Permissions } from 'src/generated/permissions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PushPermissionsToRoleScript {
  private readonly logger = new Logger(PushPermissionsToRoleScript.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: PermissionService,
  ) {}

  async run(roleId: number, channel: PermissionChannelType) {
    let role: AdminRole | UserRole;
    if (channel === PermissionChannelType.ADMIN) {
      role = await this.prisma.adminRole.findUnique({ where: { id: roleId } });
    }
    if (channel === PermissionChannelType.USER) {
      role = await this.prisma.userRole.findUnique({ where: { id: roleId } });
    }
    if (!role) {
      throw new Error(`Role with id ${roleId} not found in channel ${channel}`);
    }

    const permissions = Permissions.filter((p) => p.channels.includes(channel)) as PermissionInfo[];
    const chunkPermissions = chunk(permissions, 100);
    for (const permissions of chunkPermissions) {
      this.logger.debug(`Pushing ${permissions.length} permissions to role ${roleId} in channel ${channel}`);
      await this.prisma
        .$transaction(permissions.map((info) => this.service.addPermissionToChannel(info, channel, role)))
        .finally(() => {
          this.logger.debug(
            `Finished pushing ${permissions.length} permissions to role ${roleId} in channel ${channel}`,
          );
        });
    }

    this.logger.debug(`Pushing permissions to role ${roleId} in channel ${channel}`);
  }
}
// This is the entry point of the application
async function bootstrap() {
  const argv = minimist(process.argv.slice(2));
  const roleId = Number(argv.roleId);
  const channel = argv.channel?.toUpperCase() as PermissionChannelType;

  const app = await NestFactory.create(AppModule);
  const service = app.get(PermissionService);
  const prisma = app.get(PrismaService);

  const logger = new Logger(PushPermissionsToRoleScript.name);
  const script = new PushPermissionsToRoleScript(prisma, service);
  script
    .run(roleId, channel)
    .then(() => {
      logger.log('Running in external script mode');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(err.message);
      process.exit(0);
    });
}

if (require.main === module) {
  bootstrap().then();
}
