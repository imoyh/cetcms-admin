import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as uuid from 'uuid';

@Injectable()
export class AuthInput {
  static create(input: Prisma.AuthCreateInput) {
    if (!input.uuid) input.uuid = uuid.v4();
    input.loginAt = new Date();
    return input;
  }

  create(input: Prisma.AuthCreateInput) {
    return AuthInput.create(input);
  }
}
