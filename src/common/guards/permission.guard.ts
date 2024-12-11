import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
    console.log(context.getHandler().name, context.getClass().name);
    const request = getRequest(context);
    const auth: Auth | null = request.user;
    if (!auth) return false;
    console.log(channels);
    return Boolean(channels);
  }
}
