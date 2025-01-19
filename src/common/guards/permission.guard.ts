import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionChannelType } from 'src/api/permission/entities';
import { USE_PERMISSION_KEY, UsePermissionChannel } from 'src/common/decorators';
import { AuthTool } from 'src/common/tools';
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
    const subject = context.getClass().name;
    const action = context.getHandler().name;

    // Create auth tool
    const authTool = new AuthTool(request);

    // Check if admin has permission for each channel
    if (channels.includes(PermissionChannelType.ADMIN)) {
      if (authTool.isAdmin()) {
        return authTool.checkPermission(`${subject}:${action}`);
      }
    }

    // Check if user has permission for each channel
    if (channels.includes(PermissionChannelType.USER)) {
      if (authTool.isUser()) {
        return authTool.checkPermission(`${subject}:${action}`);
      }
    }

    return false;
  }
}
