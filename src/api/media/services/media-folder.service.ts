import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthMixin } from 'src/common/interfaces';
import { Auth, MediaStoreType } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { StringUtil } from 'src/utils/features';

import { FindFolderWhereInput, FindManyFolderArgs } from '../dto';

@Injectable()
export class MediaFolderService implements AuthMixin {
  private auth: Auth;

  constructor(private readonly prisma: PrismaService) {}

  setAuth(auth: Auth) {
    return (this.auth = auth);
  }

  getAuth() {
    if (!this.auth) {
      throw new ForbiddenException('Not authorized');
    } else {
      return this.auth;
    }
  }

  async create(input: FindFolderWhereInput) {
    input.path = StringUtil.safeDirPath(input.path);
    const auth = this.getAuth();
    const segments = ['', ...input.path.split('/').filter((s) => s)];
    let parentId: number | null = null;
    let currentPath = '';

    for (let depth = 0; depth < segments.length; depth++) {
      const segment = segments[depth] || '/';
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      const folder = await this.prisma.mediaFolder.findFirst({
        where: {
          parentId,
          name: segment,
          store: input.store,
        },
      });

      if (!folder) {
        const newFolder = await this.prisma.mediaFolder.create({
          data: {
            store: input.store,
            name: segment,
            path: currentPath,
            parentId,
            depth, // 设置深度
          },
        });
        parentId = newFolder.id;

        // 为新创建的文件夹添加权限
        await this.prisma.mediaFolderBelong.create({
          data: {
            store: input.store,
            folderId: newFolder.id,
            adminId: auth.adminId,
            userId: auth.userId,
            clientId: auth.clientId,
            path: currentPath, // 设置路径
            depth, // 设置深度
          },
        });
      } else {
        parentId = folder.id;

        // 检查用户是否已经拥有该文件夹的权限
        const belong = await this.prisma.mediaFolderBelong.findFirst({
          where: {
            store: input.store,
            folderId: folder.id,
            clientId: auth.clientId || undefined,
            adminId: auth.adminId || undefined,
            userId: auth.userId || undefined,
          },
        });

        // 如果没有权限，则为其添加
        if (!belong) {
          await this.prisma.mediaFolderBelong.create({
            data: {
              store: input.store,
              folderId: folder.id,
              adminId: auth.adminId,
              userId: auth.userId,
              clientId: auth.clientId,
              path: currentPath, // 设置路径
              depth, // 设置深度
            },
          });
        }
      }
    }

    return this.prisma.mediaFolder.findUnique({
      where: {
        storePath: {
          path: input.path,
          store: input.store,
        },
      },
    });
  }

  async findMany(args: Prisma.MediaFolderFindManyArgs) {
    const { take, skip, where, orderBy, include } = args;
    return Promise.all([
      this.prisma.mediaFolder.count({ where }),
      this.prisma.mediaFolder.findMany({
        where,
        orderBy,
        include,
        take: Math.abs(take),
        skip: Math.abs(skip),
      }),
    ]).then(([count, items]) => {
      return { count, items };
    });
  }

  async findItemsByPath(args: FindManyFolderArgs) {
    const auth = this.getAuth();
    const inputWhere = args.where;
    const path = StringUtil.safeDirPath(inputWhere.path);
    const store = inputWhere.store || MediaStoreType.LOCAL;
    const where: Prisma.MediaFolderWhereInput = {
      parent: {
        path,
        store,
      },
      belong: {
        some: {
          userId: auth.userId || undefined,
          adminId: auth.adminId || undefined,
          clientId: auth.clientId || undefined,
        },
      },
    };
    return this.findMany({
      where,
      take: Math.abs(args.limit),
      skip: Math.abs(args.limit * (args.page - 1)),
      orderBy: args.orderBy,
      include: {
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
    });
  }

  async findTreeByStore(store: MediaStoreType) {
    const auth = this.getAuth();
    const depthInclude = (depth: number, include: Prisma.MediaFolderInclude = {}, currentDepth = 1) => {
      include._count = {
        select: {
          files: true,
          children: true,
        },
      };
      if (depth > currentDepth) {
        include.children = {
          include: { ...include },
        };
        return depthInclude(depth, include, currentDepth + 1);
      }
      return include;
    };
    return this.prisma.mediaFolder.findFirst({
      include: depthInclude(6),
      where: {
        store: store || MediaStoreType.LOCAL,
        depth: 0,
        belong: {
          some: {
            userId: auth.userId || undefined,
            adminId: auth.adminId || undefined,
            clientId: auth.clientId || undefined,
          },
        },
      },
    });
  }
}
