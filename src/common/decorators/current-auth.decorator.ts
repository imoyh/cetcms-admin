import { createParamDecorator, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Auth } from 'src/generated/graphql';
import { getRequest } from 'src/helpers';

type CurrentRequestDecoratorArgs = {
  field?: string;
  required?: boolean;
  requireUser?: boolean;
  requireAdmin?: boolean;
};

export const CurrentAuth = createParamDecorator(async (args: CurrentRequestDecoratorArgs, ctx: ExecutionContext) => {
  const { field, required, requireUser, requireAdmin } = args || {};
  const request = getRequest(ctx);
  const authInfo: Auth | null = request.user;
  if (!authInfo && required) {
    throw new UnauthorizedException({
      message: 'Authentication information is missing',
    });
  }
  if (!authInfo?.adminId && requireAdmin) {
    throw new ForbiddenException({
      message: 'Admin access is required',
    });
  }
  if (!authInfo?.userId && requireUser) {
    throw new ForbiddenException({
      message: 'User access is required',
    });
  }
  return field ? authInfo?.[field] : authInfo;
});
