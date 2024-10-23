import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { getRequest } from 'src/helpers';
import { Admin, AdminRole, Auth, Client, User, UserRole } from '@prisma/client';

type CurrentRequestDecoratorArgs = {
  field?: string;
  required?: boolean;
};

export type CurrentAuthResult = Auth & {
  admin: Admin & { role: AdminRole };
  user: User & { role: UserRole };
  client: Client;
};

export const CurrentAuth = createParamDecorator(
  async (args: CurrentRequestDecoratorArgs, ctx: ExecutionContext) => {
    const { field, required } = args || {};
    const request = getRequest(ctx);
    const authInfo = request.user;
    if (!authInfo && required) {
      throw new BadRequestException({
        message: 'Authentication information is missing',
      });
    }
    return field ? authInfo?.[field] : authInfo;
  },
);
