import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Folder {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
