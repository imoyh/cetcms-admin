import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto';
import { UserOrderByWithRelationInput, UserWhereInput } from 'src/generated/graphql';

@InputType()
export class FindUserWhereInput extends UserWhereInput {}

@ArgsType()
export class FindManyUserArgs extends PaginationArgs {
  @Field(() => FindUserWhereInput, { nullable: true })
  where?: FindUserWhereInput;

  @Field(() => UserOrderByWithRelationInput, { nullable: true })
  orderBy?: UserOrderByWithRelationInput;
}
