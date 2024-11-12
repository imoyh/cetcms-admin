import { normalize } from 'path';

import { Injectable } from '@nestjs/common';
import { trim } from 'voca';

@Injectable()
export class StringUtil {
  static safeDirPath(path: string) {
    return trim(normalize(path), './');
  }

  safeDirPath(path: string) {
    return StringUtil.safeDirPath(path);
  }
}
