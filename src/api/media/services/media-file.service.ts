import * as fs from 'node:fs';
import { join } from 'path';

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileUpload } from 'graphql-upload-ts/dist/Upload';
import { FindManyFileArgs } from 'src/api/media/dto/find-many-file.args';
import { MediaFolderService } from 'src/api/media/services/media-folder.service';
import { AuthMixin } from 'src/common/interfaces';
import { Auth, MediaFileCreateInput, MediaStoreType } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { StringUtil } from 'src/utils/features';

@Injectable()
export class MediaFileService implements AuthMixin {
  private auth: Auth;

  constructor(
    private readonly prisma: PrismaService,
    private readonly folder: MediaFolderService,
  ) {}

  setAuth(auth: Auth) {
    return (this.auth = this.folder.setAuth(auth));
  }

  getAuth() {
    if (!this.auth) {
      throw new ForbiddenException('Not authorized');
    } else {
      return this.auth;
    }
  }

  async create(input: MediaFileCreateInput) {
    const auth = this.getAuth();
    try {
      input.path = StringUtil.safeDirPath(input.path);
      const folder = await this.folder.create({
        store: input.store,
        path: input.path,
      });
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

  async upload(uuid: string, file: FileUpload) {
    const media = await this.findOne(uuid);
    if (media.store !== MediaStoreType.LOCAL) {
      throw new ForbiddenException('Unsupported store type');
    }

    if (media.uploadAt) {
      throw new BadRequestException('File already uploaded');
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

    await this.prisma.mediaFile.update({
      where: { id: media.id },
      data: {
        uploadAt: new Date(),
      },
    });

    return media;
  }

  async findOne(uuid: string) {
    return this.prisma.mediaFile.findUnique({
      where: {
        uuid,
      },
    });
  }

  async findMany(args: Prisma.MediaFileFindManyArgs) {
    const { take, skip, where, orderBy, include } = args;
    return Promise.all([
      this.prisma.mediaFile.count({ where }),
      this.prisma.mediaFile.findMany({
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

  async findItemsByPath(args: FindManyFileArgs) {
    const auth = this.getAuth();
    const inputWhere = args.where || {};
    const store = inputWhere.store || MediaStoreType.LOCAL;
    const path = StringUtil.safeDirPath(inputWhere.path);
    const folder = await this.prisma.mediaFolder.findUnique({
      where: {
        path,
        store,
        belong: {
          some: {
            userId: auth.userId || undefined,
            adminId: auth.adminId || undefined,
            clientId: auth.clientId || undefined,
          },
        },
      },
    });
    if (!folder) {
      throw new BadRequestException('Folder not found');
    }
    const where: Prisma.MediaFileWhereInput = {
      folderId: folder.id,
      userId: auth.userId || undefined,
      adminId: auth.adminId || undefined,
      clientId: auth.clientId || undefined,
    };
    return this.findMany({
      where,
      take: Math.abs(args.limit),
      skip: Math.abs(args.limit * (args.page - 1)),
      orderBy: args.orderBy,
    });
  }
}
