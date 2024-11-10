import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as uuid from 'uuid';
import { trim } from 'voca';

@Injectable()
export class AdminInput {
  static create(input: Prisma.AdminCreateInput) {
    if (!input.uuid) input.uuid = uuid.v4();
    if (input.email) input.email = trim(input.email.toLowerCase());
    return input;
  }

  create(input: Prisma.AdminCreateInput) {
    return AdminInput.create(input);
  }
}
