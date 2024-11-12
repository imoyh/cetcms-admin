import { Injectable } from '@nestjs/common';
import CUID from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthInput {
  static create(input: Prisma.AuthCreateInput) {
    input.loginAt = new Date();
    return input;
  }

  static generateCUID() {
    return CUID.createId();
  }

  create(input: Prisma.AuthCreateInput) {
    return AuthInput.create(input);
  }
}
