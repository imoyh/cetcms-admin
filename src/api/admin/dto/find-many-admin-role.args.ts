import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto';
import { AdminRoleOrderByWithRelationInput, AdminRoleWhereInput } from 'src/generated/graphql';

@InputType()
export class FindAdminRoleWhereInput extends AdminRoleWhereInput {}

@ArgsType()
export class FindManyAdminRoleArgs extends PaginationArgs {
  @Field(() => FindAdminRoleWhereInput, { nullable: true })
  where?: FindAdminRoleWhereInput;

  @Field(() => AdminRoleOrderByWithRelationInput, { nullable: true })
  orderBy?: AdminRoleOrderByWithRelationInput;
}
