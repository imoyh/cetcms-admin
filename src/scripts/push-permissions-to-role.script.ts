import * as process from 'process';

import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { chunk } from 'lodash';
import minimist from 'minimist';
import { PermissionChannelType, PermissionInfo } from 'src/api/permission/entities';
import { PermissionService } from 'src/api/permission/permission.service';
import { AppModule } from 'src/app.module';
import { AuthTool } from 'src/common/tools';
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
    if (!roleId || !channel) {
      throw new Error('roleId and channel are required');
    }

    this.logger.log(`Starting to push permissions to role ${roleId} in channel ${channel}`);

    let role: AdminRole | UserRole;
    if (channel === PermissionChannelType.ADMIN) {
      role = await this.prisma.adminRole.findUnique({ where: { id: roleId } });
    } else if (channel === PermissionChannelType.USER) {
      role = await this.prisma.userRole.findUnique({ where: { id: roleId } });
    } else {
      throw new Error(`Invalid channel type: ${channel}`);
    }

    if (!role) {
      throw new Error(`Role with id ${roleId} not found in channel ${channel}`);
    }

    const permissions = Permissions.filter((p) => p.channels.includes(channel)) as PermissionInfo[];
    const chunkPermissions = chunk(permissions, 100);

    let processedCount = 0;
    for (const permissionChunk of chunkPermissions) {
      try {
        await this.prisma.$transaction(
          permissionChunk.map((info) => this.service.addPermissionToChannel(info, channel, role)),
        );
        processedCount += permissionChunk.length;
        this.logger.debug(`Processed ${processedCount}/${permissions.length} permissions`);
      } catch (error) {
        this.logger.error(`Failed to process permissions chunk: ${error.message}`);
        throw error;
      }
    }

    this.logger.log(`Successfully pushed ${permissions.length} permissions to role ${roleId} in channel ${channel}`);
  }
}
// This is the entry point of the application
async function bootstrap() {
  const argv = minimist(process.argv.slice(2));
  const roleId = Number(argv.roleId);
  const channel = argv.channel?.toUpperCase() as PermissionChannelType;

  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);
  const service = new PermissionService(prisma, new AuthTool({}));

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
