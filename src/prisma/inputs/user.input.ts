import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { trim } from 'voca';

@Injectable()
export class UserInput {
  static create(input: Prisma.UserCreateInput) {
    if (input.email) input.email = trim(input.email.toLowerCase());
    if (input.firstName && input.lastName) input.fullName = `${input.firstName} ${input.lastName}`;
    return input;
  }

  static update(input: Prisma.UserUpdateInput) {
    return UserInput.create(input as Prisma.UserCreateInput) as Prisma.UserUpdateInput;
  }

  create(input: Prisma.UserCreateInput) {
    return UserInput.create(input);
  }

  update(input: Prisma.UserUpdateInput) {
    return UserInput.update(input);
  }
}
