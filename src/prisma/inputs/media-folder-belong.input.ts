import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StringUtil } from 'src/utils/features';

@Injectable()
export class MediaFolderBelongInput {
  static create(input: Prisma.MediaFolderBelongCreateInput) {
    input.path = `/${StringUtil.safeDirPath(input.path)}/`;
    return input;
  }

  create(input: Prisma.MediaFolderBelongCreateInput) {
    return MediaFolderBelongInput.create(input);
  }
}
