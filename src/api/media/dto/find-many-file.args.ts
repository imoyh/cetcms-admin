import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto';
import { MediaFileOrderByWithRelationInput, MediaStoreType } from 'src/generated/graphql';

@InputType()
export class FindFileWhereInput {
  @Field(() => MediaStoreType, { nullable: true })
  store?: keyof typeof MediaStoreType;

  @Field(() => String, { nullable: true })
  path?: string;
}

@ArgsType()
export class FindManyFileArgs extends PaginationArgs {
  @Field(() => FindFileWhereInput, { nullable: true })
  where?: FindFileWhereInput;

  @Field(() => MediaFileOrderByWithRelationInput, { nullable: true })
  orderBy?: MediaFileOrderByWithRelationInput;
}
