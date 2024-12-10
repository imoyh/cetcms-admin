import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto';
import { AdminOrderByWithRelationInput, AdminWhereInput } from 'src/generated/graphql';

@InputType()
export class FindAdminWhereInput extends AdminWhereInput {}

@ArgsType()
export class FindManyAdminArgs extends PaginationArgs {
  @Field(() => FindAdminWhereInput, { nullable: true })
  where?: FindAdminWhereInput;

  @Field(() => AdminOrderByWithRelationInput, { nullable: true })
  orderBy?: AdminOrderByWithRelationInput;
}
