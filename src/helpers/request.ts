import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function getRequest(context: ExecutionContext) {
  switch (context.getType()) {
    case 'http':
      return context.switchToHttp().getRequest();
    case 'rpc':
      return context.switchToRpc().getContext();
    case 'ws':
      return context.switchToWs().getClient();
    default:
      if (String(context.getType()) === 'graphql') {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
      }
      throw new BadRequestException({
        message: 'Invalid request type',
        variables: { contextType: context.getType() },
      });
  }
}
