import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { MediaFileOrderByWithRelationInput, MediaStoreType } from 'src/generated/graphql';

@InputType()
export class FindFileWhereInput {
  @Field(() => MediaStoreType, { nullable: true })
  store?: keyof typeof MediaStoreType;

  @Field(() => String, { nullable: true })
  path?: string;
}

@ArgsType()
export class FindManyFilesArgs {
  @Field(() => FindFileWhereInput, { nullable: true })
  @Type(() => FindFileWhereInput)
  where?: FindFileWhereInput;

  @Field(() => MediaFileOrderByWithRelationInput, { nullable: true })
  orderBy?: MediaFileOrderByWithRelationInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;
}
