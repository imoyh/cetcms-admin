import { Client } from '@prisma/client';
import { AuthUserType } from 'src/api/api.graphql';
import { ForbiddenException } from '@nestjs/common';

export function pickUserTypeInClient(type: AuthUserType, client: Client) {
  type = (type || '').toUpperCase() as AuthUserType;
  if (!client.allowUserAuth && type === AuthUserType.USER) {
    throw new ForbiddenException('User authentication is not allowed');
  }
  if (!client.allowAdminAuth && type === AuthUserType.ADMIN) {
    throw new ForbiddenException('Admin authentication is not allowed');
  }
  if (!type) {
    if (client.allowUserAuth) {
      type = AuthUserType.USER;
    } else if (client.allowAdminAuth) {
      type = AuthUserType.ADMIN;
    }
  }
  if (!type) {
    throw new ForbiddenException('No authentication type is allowed');
  }
  return type;
}
