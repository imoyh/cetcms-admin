import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PermissionChannelType, PermissionInfo } from 'src/api/permission/entities';
import { AdminRole, UserRole } from 'src/generated/graphql';
import { Permissions } from 'src/generated/permissions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(channel: PermissionChannelType) {
    return Permissions.filter((p) => p.channels.includes(channel));
  }

  async addPermissionToChannel(info: PermissionInfo, channel: PermissionChannelType, role: UserRole | AdminRole) {
    // Check if permission already exists in the channel
    info = Permissions.find((p: PermissionInfo) => {
      return p.resource === info.resource && p.action === info.action && p.channels.includes(channel);
    }) as PermissionInfo;
    if (!info) {
      throw new BadRequestException('Permission not found');
    }

    // Add permission to role
    const roleId = role.id;
    const permission = `${info.resource}:${info.action}`;

    // Build upsert arguments
    const args: Prisma.UserRoleUpdateArgs & Prisma.AdminRoleUpdateArgs = {
      where: { uuid: role.uuid },
      data: {
        permissions: {
          upsert: {
            where: {
              rolePermissionIndex: { roleId, permission },
            },
            update: { permission },
            create: { permission },
          },
        },
      },
    };

    // Update user role
    if (channel === PermissionChannelType.USER) {
      return this.prisma.userRole.update(args);
    }

    // Update admin role
    if (channel === PermissionChannelType.ADMIN) {
      this.prisma.adminRole.update(args);
    }

    throw new BadRequestException('Not implemented');
  }
}
