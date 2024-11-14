import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, description: 'Example field (placeholder)' })
  skip?: number;

  @Field(() => Int, { nullable: true, description: 'Example field (placeholder)' })
  take?: number;
}
