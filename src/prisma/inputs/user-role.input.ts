import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as uuid from 'uuid';
import { snakeCase, trim } from 'voca';

@Injectable()
export class UserRoleInput {
  static create(input: Prisma.UserRoleCreateInput) {
    if (!input.uuid) input.uuid = uuid.v4();
    if (input.name) input.name = snakeCase(trim(input.name)).toUpperCase();
    return input;
  }

  create(input: Prisma.UserRoleCreateInput) {
    return UserRoleInput.create(input);
  }
}
