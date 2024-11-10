import { PartialType } from '@nestjs/mapped-types';

import { CreateAuthInput } from './create-auth.input';

export class UpdateAuthInput extends PartialType(CreateAuthInput) {
  id: number;
}
