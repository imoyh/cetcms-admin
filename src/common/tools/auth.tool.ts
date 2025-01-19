import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Auth } from 'src/generated/graphql';

@Injectable({ scope: Scope.REQUEST })
export class AuthTool {
  private auth: Auth;

  constructor(@Inject(REQUEST) private requestContext: any) {}

  set(auth: Auth) {
    return (this.auth = auth);
  }

  get(): Auth {
    const auth = this.auth || this.requestContext?.req?.user || this.requestContext?.user;
    if (!auth) {
      throw new ForbiddenException('Not authorized');
    } else {
      return auth;
    }
  }

  isAdmin() {
    const auth = this.get();
    return Boolean(auth.admin);
  }

  isUser() {
    const auth = this.get();
    return Boolean(auth.user);
  }

  role() {
    const auth = this.get();
    return auth.user?.role || auth.admin?.role;
  }

  checkPermission(resource: string) {
    const role = this.role();
    return role?.permissions?.some((p) => p.resource === resource);
  }
}
