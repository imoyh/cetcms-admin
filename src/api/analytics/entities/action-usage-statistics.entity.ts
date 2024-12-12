import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActionUsageStatistics {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  count: number;
}
