import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  INestApplication,
} from '@nestjs/common';
import { getRequest } from 'src/helpers';
import { PrismaService } from 'src/prisma/prisma.service';

type CurrentClientDecoratorArgs = {
  field?: string;
  required?: boolean;
};

export const CurrentClient = createParamDecorator(async (args: CurrentClientDecoratorArgs, ctx: ExecutionContext) => {
  const { field, required } = args || {};
  const request = getRequest(ctx);
  const app: INestApplication = request.app.get('instance');
  const prisma = app.get(PrismaService);
  const clientId = request.headers['x-client-id'];
  if (!clientId && required) {
    throw new BadRequestException('X-Client-ID is missing');
  }
  const client = await prisma.client.findFirst({
    where: { uuid: clientId },
  });
  if (!client && required) {
    throw new ForbiddenException('Invalid X-Client-ID');
  }
  return field ? client?.[field] : client;
});
