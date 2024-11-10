import * as fs from 'node:fs';
import { join } from 'path';

import { ForbiddenException, Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload-ts/dist/Upload';
import { Auth, Media, MediaCreateInput, MediaStoreType } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: MediaCreateInput, auth: Auth) {
    return this.prisma.media.create({
      data: {
        fileName: input.fileName,
        fileExt: input.fileExt,
        fileMime: input.fileMime,
        fileSize: input.fileSize,
        storePath: input.storePath,
        storeType: MediaStoreType.LOCAL,
        urlPath: '',
        baseUrl: null,
        user: auth.userId ? { connect: { id: auth.userId } } : undefined,
        admin: auth.adminId ? { connect: { id: auth.adminId } } : undefined,
        client: auth.clientId ? { connect: { id: auth.clientId } } : undefined,
      },
    });
  }

  findAll() {
    return `This action returns all media`;
  }

  async findOne(uuid: string) {
    return this.prisma.media.findUnique({
      where: {
        uuid,
      },
    });
  }
  toFile(media: Media) {
    if (media.storeType === MediaStoreType.LOCAL) {
    } else {
      throw new ForbiddenException('Unsupported store type');
    }
  }

  async upload(uuid: string, file: FileUpload) {
    const media = await this.findOne(uuid);
    if (media.storeType !== MediaStoreType.LOCAL) {
      throw new ForbiddenException('Unsupported store type');
    }

    const { createReadStream } = file;
    const stream = createReadStream();
    const savePath = join(process.cwd(), 'data/media', media.storePath);

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

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
