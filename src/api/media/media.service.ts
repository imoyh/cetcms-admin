import * as fs from 'node:fs';
import { join } from 'path';

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileUpload } from 'graphql-upload-ts/dist/Upload';
import { Auth, MediaFileCreateInput, MediaStoreType } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { StringUtil } from 'src/utils/features';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async createFile(input: MediaFileCreateInput, auth: Auth) {
    try {
      input.path = StringUtil.safeDirPath(input.path);
      const folder = await this.createFolder(input.path, auth);
      const path = `${auth.user?.uuid || auth.admin?.uuid || auth.client?.uuid}/${folder.path}`;
      input.path = StringUtil.safeDirPath(path);
      return await this.prisma.mediaFile.create({
        data: {
          path: input.path,
          store: input.store,
          fileName: input.fileName,
          fileExt: input.fileExt,
          fileMime: input.fileMime,
          fileSize: input.fileSize,
          userId: auth.userId,
          adminId: auth.adminId,
          clientId: auth.clientId,
          folderId: folder.id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('File already exists');
        }
      }
      throw error;
    }
  }

  async createFolder(path: string, auth: Auth) {
    path = StringUtil.safeDirPath(path) || 'default';
    const segments = path.split('/');
    let parentId: number | null = null;
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      const folder = await this.prisma.mediaFolder.findFirst({
        where: { name: segment, parentId },
      });

      if (!folder) {
        const newFolder = await this.prisma.mediaFolder.create({
          data: {
            name: segment,
            path: currentPath,
            parentId,
            depth: i + 1, // 设置深度
          },
        });
        parentId = newFolder.id;

        // 为新创建的文件夹添加权限
        await this.prisma.mediaFolderBelong.create({
          data: {
            folderId: newFolder.id,
            adminId: auth.adminId,
            userId: auth.userId,
            clientId: auth.clientId,
            path: currentPath, // 设置路径
            depth: i + 1, // 设置深度
          },
        });
      } else {
        parentId = folder.id;

        // 检查用户是否已经拥有该文件夹的权限
        const belong = await this.prisma.mediaFolderBelong.findFirst({
          where: {
            folderId: folder.id,
            OR: [{ adminId: auth.adminId }, { userId: auth.userId }, { clientId: auth.clientId }],
          },
        });

        // 如果没有权限，则为其添加
        if (!belong) {
          await this.prisma.mediaFolderBelong.create({
            data: {
              folderId: folder.id,
              adminId: auth.adminId,
              userId: auth.userId,
              clientId: auth.clientId,
              path: currentPath, // 设置路径
              depth: i + 1, // 设置深度
            },
          });
        }
      }
    }

    return this.prisma.mediaFolder.findUnique({
      where: { path: `/${path}/` },
    });
  }

  async uploadFile(uuid: string, file: FileUpload) {
    const media = await this.findOne(uuid);
    if (media.store !== MediaStoreType.LOCAL) {
      throw new ForbiddenException('Unsupported store type');
    }

    const { createReadStream } = file;
    const stream = createReadStream();
    const savePath = join(process.cwd(), 'data/media', media.path);

    const streamToArrayBufferView = async (): Promise<NodeJS.ArrayBufferView> => {
      return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk)); // 将每个 chunk 转换为 Buffer
        });
        stream.on('end', () => {
          // 将数组的 Buffer 连接成一个完整的 Buffer
          const buffer = Buffer.concat(chunks);
          // 转换为 Uint8Array
          resolve(new Uint8Array(buffer));
        });
        stream.on('error', (err) => {
          reject(err);
        });
      });
    };

    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });
    fs.writeFileSync(join(savePath, media.fileName), await streamToArrayBufferView());

    return media;
  }

  async remove(id: number) {
    return `This action removes a #${id} media`;
  }

  async findAll() {
    return `This action returns all media`;
  }

  async findOne(uuid: string) {
    return this.prisma.mediaFile.findUnique({
      where: {
        uuid,
      },
    });
  }

  async findFolders() {
    return Promise.resolve(undefined);
  }
}
