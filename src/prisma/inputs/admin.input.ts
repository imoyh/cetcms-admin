import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { trim } from 'voca';

@Injectable()
export class AdminInput {
  static create(input: Prisma.AdminCreateInput) {
    if (input.email) input.email = trim(input.email.toLowerCase());
    return input;
  }

  static update(input: Prisma.AdminUpdateInput) {
    return AdminInput.create(input as Prisma.AdminCreateInput) as Prisma.AdminUpdateInput;
  }

  create(input: Prisma.AdminCreateInput) {
    return AdminInput.create(input);
  }

  update(input: Prisma.AdminUpdateInput) {
    return AdminInput.update(input);
  }
}
