import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StringUtil } from 'src/utils/features';

@Injectable()
export class MediaFolderInput {
  static create(input: Prisma.MediaFolderCreateInput) {
    input.path = `/${StringUtil.safeDirPath(input.path)}/`;
    return input;
  }

  create(input: Prisma.MediaFolderCreateInput) {
    return MediaFolderInput.create(input);
  }
}
