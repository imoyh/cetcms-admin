import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto';
import { MediaFolderOrderByWithRelationInput, MediaStoreType } from 'src/generated/graphql';

@InputType()
export class FindFolderWhereInput {
  @Field(() => MediaStoreType, { nullable: true })
  store?: keyof typeof MediaStoreType;

  @Field(() => String, { nullable: true })
  path?: string;
}

@ArgsType()
export class FindManyFolderArgs extends PaginationArgs {
  @Field(() => FindFolderWhereInput, { nullable: true })
  where?: FindFolderWhereInput;

  @Field(() => MediaFolderOrderByWithRelationInput, { nullable: true })
  orderBy?: MediaFolderOrderByWithRelationInput;
}
