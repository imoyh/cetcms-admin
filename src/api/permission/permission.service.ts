import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PermissionChannelType, PermissionInfo } from 'src/api/permission/entities';
import { AdminRole, UserRole } from 'src/generated/graphql';
import { Permissions } from 'src/generated/permissions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all permissions for channel
   * @param channel
   */
  findAll(channel: PermissionChannelType) {
    return Permissions.filter((p) => p.channels.includes(channel));
  }

  /**
   * Find permission by resource and action
   * @param channel
   * @param subject
   * @param action
   */
  findPermission(channel: PermissionChannelType, subject: string, action: string): PermissionInfo | undefined {
    return Permissions.find((p) => p.channels.includes(channel) && p.subject === subject && p.action === action) as
      | PermissionInfo
      | undefined;
  }

  /**
   * Find permission by role and resource and action
   * @param channel
   * @param role
   * @param subject
   * @param action
   */
  findRolePermission(channel: PermissionChannelType, role: UserRole | AdminRole, subject: string, action: string) {
    const args: Prisma.UserRolePermissionFindUniqueArgs & Prisma.AdminRolePermissionFindUniqueArgs = {
      where: {
        roleResourceIndex: {
          roleId: role.id,
          resource: `${subject}:${action}`,
        },
      },
    };

    if (channel === PermissionChannelType.USER) {
      return this.prisma.userRolePermission.findUnique(args);
    }
    if (channel === PermissionChannelType.ADMIN) {
      return this.prisma.adminRolePermission.findUnique(args);
    }

    throw new BadRequestException('Not implemented');
  }

  /**
   * Add permission to channel for role
   * @param info
   * @param channel
   * @param role
   */
  addPermissionToChannel(info: PermissionInfo, channel: PermissionChannelType, role: UserRole | AdminRole) {
    // Check if permission already exists in the channel
    info = this.findPermission(channel, info.subject, info.action);
    if (!info) {
      throw new BadRequestException('Permission not found');
    }

    // Add permission to role
    const roleId = role.id;
    const resource = `${info.subject}:${info.action}`;

    // Build upsert arguments
    const args: Prisma.UserRoleUpdateArgs & Prisma.AdminRoleUpdateArgs = {
      where: { uuid: role.uuid },
      data: {
        permissions: {
          upsert: {
            where: {
              roleResourceIndex: { roleId, resource },
            },
            update: { resource },
            create: { resource },
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
      return this.prisma.adminRole.update(args);
    }

    throw new BadRequestException('Not implemented');
  }

  /**
   * Add permission bind to role
   * @param channel
   * @param targetId
   * @param subject
   * @param action
   */
  async addPermissionBind(channel: PermissionChannelType, targetId: string, subject: string, action: string) {
    // Check if permission already exists in the channel
    const info = this.findPermission(channel, subject, action);
    if (!info) {
      throw new BadRequestException('Permission not found');
    }

    // Find role
    let role: UserRole | AdminRole;
    if (channel === PermissionChannelType.USER) {
      role = await this.prisma.userRole.findUnique({ where: { uuid: targetId } });
    }
    if (channel === PermissionChannelType.ADMIN) {
      role = await this.prisma.adminRole.findUnique({ where: { uuid: targetId } });
    }

    // Add permission to role
    await this.addPermissionToChannel(info, channel, role);

    // Return permission info
    return info;
  }
}
