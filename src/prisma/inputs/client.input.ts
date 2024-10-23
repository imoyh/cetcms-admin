import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { snakeCase, trim } from 'voca';
import * as uuid from 'uuid';

@Injectable()
export class ClientInput {
  static create(input: Prisma.ClientCreateInput) {
    input.uuid = uuid.v4();
    if (input.name) input.name = trim(snakeCase(input.name).toUpperCase());
    return input;
  }

  create(input: Prisma.ClientCreateInput) {
    return ClientInput.create(input);
  }
}
