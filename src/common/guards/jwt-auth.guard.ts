import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_ACCESS_KEY } from 'src/common/decorators';
import { getRequest } from 'src/helpers';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    if (this.isPublicAccess(context)) {
      return true;
    }
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    return getRequest(context);
  }

  handleRequest(error: Error, user: any, info: Error) {
    if (error || !user) {
      throw new UnauthorizedException({
        message: error?.message || info?.message || 'Invalid token',
      });
    }
    return user;
  }

  private isPublicAccess(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ACCESS_KEY, [context.getHandler(), context.getClass()]);
  }
}
