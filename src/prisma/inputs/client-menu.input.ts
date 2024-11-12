import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { snakeCase, trim } from 'voca';

@Injectable()
export class ClientMenuInput {
  static create(input: Prisma.ClientMenuCreateInput) {
    if (input.name) input.name = snakeCase(trim(input.name)).toLowerCase();
    if (input.children?.createMany?.data) {
      const data = input.children.createMany.data;
      if (Array.isArray(data)) {
        input.children.createMany.data = data.map((item) => {
          return ClientMenuInput.create(item);
        });
      } else {
        input.children.createMany.data = ClientMenuInput.create(data);
      }
    }
    return input;
  }

  create(input: Prisma.ClientMenuCreateInput) {
    return ClientMenuInput.create(input);
  }
}
