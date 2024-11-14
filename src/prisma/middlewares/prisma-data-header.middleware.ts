import { Prisma } from '@prisma/client';
import { PrismaAction } from 'prisma-redis-middleware/dist/types';
import {
  AdminInput,
  AdminRoleInput,
  AuthInput,
  ClientInput,
  ClientMenuInput,
  MediaFileInput,
  MediaFolderBelongInput,
  MediaFolderInput,
  UserInput,
  UserRoleInput,
} from 'src/prisma/inputs';

type ActionsHandler = Record<PrismaAction, (data: any) => any>;
type ModelsHandler = Record<Prisma.ModelName, Partial<ActionsHandler>>;

const handlers: ModelsHandler = {
  Admin: {
    create: AdminInput.create,
  },
  AdminRole: {
    create: AdminRoleInput.create,
  },
  Auth: {
    create: AuthInput.create,
  },
  MediaFile: {
    create: MediaFileInput.create,
  },
  MediaFolder: {
    create: MediaFolderInput.create,
  },
  MediaFolderBelong: {
    create: MediaFolderBelongInput.create,
  },
  Client: {
    create: ClientInput.create,
  },
  ClientMenu: {
    create: ClientMenuInput.create,
  },
  User: {
    create: UserInput.create,
  },
  UserRole: {
    create: UserRoleInput.create,
  },
  Language: undefined,
  ClientLanguage: undefined,
};

export const PrismaDataHeaderMiddleware: Prisma.Middleware = async (params, next) => {
  const handler = handlers[params.model];
  if (handler && handler[params.action]) {
    if (params.action === 'create' && params.args.data) {
      params.args.data = handler[params.action](params.args.data);
    }
    if (params.action === 'findUnique' && params.args.where) {
      params.args.where = handler[params.action](params.args.where);
    }
  }
  return next(params);
};
