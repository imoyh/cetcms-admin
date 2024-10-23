import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { camelCase, capitalize, trim } from 'voca';

@Injectable()
export class UserRoleInput {
  static create(input: Prisma.UserRoleCreateInput) {
    if (input.name) {
      input.name = camelCase(trim(input.name));
      input.name = capitalize(input.name);
    }
    return input;
  }

  create(input: Prisma.UserRoleCreateInput) {
    return UserRoleInput.create(input);
  }
}
