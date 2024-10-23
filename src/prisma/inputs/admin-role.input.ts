import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { camelCase, capitalize, trim } from 'voca';

@Injectable()
export class AdminRoleInput {
  static create(input: Prisma.AdminRoleCreateInput) {
    if (input.name) {
      input.name = camelCase(trim(input.name));
      input.name = capitalize(input.name);
    }
    return input;
  }

  create(input: Prisma.AdminRoleCreateInput) {
    return AdminRoleInput.create(input);
  }
}
