import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Auth, MediaStoreType } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { StringUtil } from 'src/utils/features';

import { FindFolderWhereInput, FindManyFoldersArgs } from '../dto';

@Injectable()
export class MediaFolderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(auth: Auth, input: FindFolderWhereInput) {
    input.path = StringUtil.safeDirPath(input.path);
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

  async findItemsByPath(auth: Auth, args: FindManyFoldersArgs) {
    const where = args.where;
    const path = StringUtil.safeDirPath(where.path);
    const store = where.store || MediaStoreType.LOCAL;
    return this.prisma.mediaFolder.findMany({
      take: args.take,
      skip: args.skip,
      orderBy: args.orderBy,
      include: {
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
      where: {
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
      },
    });
  }

  async findTreeByStore(auth: Auth, store: MediaStoreType) {
    const depthInclude = (
      depth: number,
      include: Prisma.MediaFolderFindFirstArgs['include'] = {},
      currentDepth = 1,
    ) => {
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
