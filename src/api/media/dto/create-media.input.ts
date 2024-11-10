import { Field, InputType } from '@nestjs/graphql';
import { MediaStoreType } from 'src/generated/graphql';

@InputType()
export class CreateMediaInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  fileName: number;

  @Field(() => MediaStoreType, { description: 'Example field (placeholder)' })
  storeType: MediaStoreType;
}
