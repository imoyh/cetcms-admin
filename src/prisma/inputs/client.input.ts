import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { snakeCase, trim } from 'voca';

@Injectable()
export class ClientInput {
  static create(input: Prisma.ClientCreateInput) {
    if (input.name) input.name = trim(snakeCase(input.name).toUpperCase());
    return input;
  }

  create(input: Prisma.ClientCreateInput) {
    return ClientInput.create(input);
  }
}
