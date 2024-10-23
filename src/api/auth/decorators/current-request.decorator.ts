import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from 'src/helpers';

type CurrentRequestDecoratorArgs = {
  field?: string;
};

export const CurrentRequest = createParamDecorator(
  async (_args: CurrentRequestDecoratorArgs, ctx: ExecutionContext) => {
    return getRequest(ctx);
  },
);
