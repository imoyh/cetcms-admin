import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto';
import { UserRoleOrderByWithRelationInput, UserRoleWhereInput } from 'src/generated/graphql';

@InputType()
export class FindUserRoleWhereInput extends UserRoleWhereInput {}

@ArgsType()
export class FindManyUserRoleArgs extends PaginationArgs {
  @Field(() => FindUserRoleWhereInput, { nullable: true })
  where?: FindUserRoleWhereInput;

  @Field(() => UserRoleOrderByWithRelationInput, { nullable: true })
  orderBy?: UserRoleOrderByWithRelationInput;
}
