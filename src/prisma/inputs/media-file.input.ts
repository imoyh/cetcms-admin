import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StringUtil } from 'src/utils/features';

@Injectable()
export class MediaFileInput {
  static create(input: Prisma.MediaFileCreateInput) {
    const extname = path.extname(input.fileName);
    const basename = path.basename(input.fileName, extname).toLowerCase();
    input.path = StringUtil.safeDirPath(input.path);
    input.fileExt = extname.toLowerCase();
    input.fileName = `${basename}${extname}`;
    return input;
  }

  create(input: Prisma.MediaFileCreateInput) {
    return MediaFileInput.create(input);
  }
}
