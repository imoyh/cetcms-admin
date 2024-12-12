import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionChannelType } from 'src/api/permission/entities';
import { PermissionService } from 'src/api/permission/permission.service';
import { USE_PERMISSION_KEY, UsePermissionChannel } from 'src/common/decorators';
import { Auth } from 'src/generated/graphql';
import { getRequest } from 'src/helpers';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    return await this.checkPermission(context);
  }

  private async checkPermission(context: ExecutionContext) {
    const channels = this.reflector.getAllAndOverride<UsePermissionChannel[]>(USE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = getRequest(context);
    const auth: Auth | null = request.user;

    // Check if user is authenticated
    if (!auth) return false;

    // Get resource and action from context
    const resource = context.getClass().name;
    const action = context.getHandler().name;
    // Get prisma service from context
    const { prisma } = context.getArgByIndex(2);
    if (!prisma) {
      throw new Error('Prisma service not injected');
    }

    // Get permission service
    const service = new PermissionService(prisma);

    // Check if admin has permission for each channel
    if (channels.includes(PermissionChannelType.ADMIN)) {
      if (auth.admin?.role) {
        const permission = await service.findRolePermission(
          PermissionChannelType.ADMIN,
          auth.admin.role,
          resource,
          action,
        );
        return Boolean(permission);
      }
    }

    // Check if user has permission for each channel
    if (channels.includes(PermissionChannelType.USER)) {
      if (auth.user?.role) {
        const permission = await service.findRolePermission(
          PermissionChannelType.USER,
          auth.user.role,
          resource,
          action,
        );
        return Boolean(permission);
      }
    }

    return false;
  }
}
