import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Media {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
