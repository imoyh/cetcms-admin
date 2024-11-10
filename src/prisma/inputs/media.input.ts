import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as uuid from 'uuid';
import { slugify, trim } from 'voca';

@Injectable()
export class MediaInput {
  static create(input: Prisma.MediaCreateInput) {
    if (!input.uuid) input.uuid = uuid.v4();
    const whitespaces = ' ./';
    let name = path.basename(input.fileName);
    name = name.split('.').slice(0, -1).join('.');
    name = trim(slugify(name.toLowerCase()), whitespaces);
    const extname = trim(path.extname(input.fileName).toLowerCase(), whitespaces);
    input.fileExt = extname;
    input.fileName = `${name}.${extname}`;
    input.storePath = `/${trim((input.storePath || '/').toLowerCase(), whitespaces)
      .split('/')
      .filter((v) => v)
      .join('/')}`;
    input.urlPath = `/${trim(`${input.storePath}/${input.fileName}`, whitespaces)}`;

    return input;
  }

  create(input: Prisma.MediaCreateInput) {
    return MediaInput.create(input);
  }
}
