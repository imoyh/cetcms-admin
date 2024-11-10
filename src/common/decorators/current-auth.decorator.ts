import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from 'src/helpers';

type CurrentRequestDecoratorArgs = {
  field?: string;
  required?: boolean;
};

export const CurrentAuth = createParamDecorator(async (args: CurrentRequestDecoratorArgs, ctx: ExecutionContext) => {
  const { field, required } = args || {};
  const request = getRequest(ctx);
  const authInfo = request.user;
  if (!authInfo && required) {
    throw new BadRequestException({
      message: 'Authentication information is missing',
    });
  }
  return field ? authInfo?.[field] : authInfo;
});
