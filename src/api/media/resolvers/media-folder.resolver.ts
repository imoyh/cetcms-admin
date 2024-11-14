import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindFolderWhereInput, FindManyFoldersArgs } from 'src/api/media/dto';
import { CurrentAuth } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth, MediaFile, MediaFolder } from 'src/generated/graphql';

import { MediaFolderService } from '../services';

@UseGuards(JwtAuthGuard)
@Resolver(() => MediaFile)
export class MediaFolderResolver {
  constructor(private readonly service: MediaFolderService) {}

  @Query(() => [MediaFolder])
  findMediaFolders(@CurrentAuth() auth: Auth, @Args() args: FindManyFoldersArgs) {
    return this.service.findItemsByPath(auth, args);
  }

  @Mutation(() => MediaFolder)
  createMediaFolder(@CurrentAuth() auth: Auth, @Args('input') input: FindFolderWhereInput) {
    return this.service.create(auth, input);
  }
}
