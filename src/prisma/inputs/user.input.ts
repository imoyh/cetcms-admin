import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { trim } from 'voca';

@Injectable()
export class UserInput {
  static create(input: Prisma.UserCreateInput) {
    if (input.email) input.email = trim(input.email.toLowerCase());
    return input;
  }

  create(input: Prisma.UserCreateInput) {
    return UserInput.create(input);
  }
}
