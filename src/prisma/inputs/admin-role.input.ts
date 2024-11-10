import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as uuid from 'uuid';
import { snakeCase, trim } from 'voca';

@Injectable()
export class AdminRoleInput {
  static create(input: Prisma.AdminRoleCreateInput) {
    if (!input.uuid) input.uuid = uuid.v4();
    if (input.name) input.name = snakeCase(trim(input.name)).toUpperCase();
    return input;
  }

  create(input: Prisma.AdminRoleCreateInput) {
    return AdminRoleInput.create(input);
  }
}
