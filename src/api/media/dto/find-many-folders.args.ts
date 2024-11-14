import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { MediaFolderOrderByWithRelationInput, MediaStoreType } from 'src/generated/graphql';

@InputType()
export class FindFolderWhereInput {
  @Field(() => MediaStoreType, { nullable: true })
  store?: keyof typeof MediaStoreType;

  @Field(() => String, { nullable: true })
  path?: string;
}

@ArgsType()
export class FindManyFoldersArgs {
  @Field(() => FindFolderWhereInput, { nullable: true })
  @Type(() => FindFolderWhereInput)
  where?: FindFolderWhereInput;

  @Field(() => MediaFolderOrderByWithRelationInput, { nullable: true })
  orderBy?: MediaFolderOrderByWithRelationInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;
}
