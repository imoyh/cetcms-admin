import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { FindManyFilesArgs } from 'src/api/media/dto/find-many-files.args';
import { CurrentAuth } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth, MediaFile, MediaFileCreateInput } from 'src/generated/graphql';

import { MediaFileService } from '../services';

@UseGuards(JwtAuthGuard)
@Resolver(() => MediaFile)
export class MediaFileResolver {
  constructor(private readonly service: MediaFileService) {}

  @Mutation(() => MediaFile)
  createMediaFile(@Args('input') input: MediaFileCreateInput, @CurrentAuth() auth: Auth) {
    return this.service.create(input, auth);
  }

  @Mutation(() => MediaFile)
  uploadMediaFile(
    @Args('uuid', { type: () => String }) uuid: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.service.upload(uuid, file);
  }

  @Query(() => [MediaFile])
  findMediaFiles(@CurrentAuth() auth: Auth, @Args() args: FindManyFilesArgs) {
    return this.service.findItemsByPath(auth, args);
  }

  @ResolveField(() => String)
  async url(@Parent() media: MediaFile) {
    return `http://localhost:3325/media${media.path}${media.fileName}`;
  }
}
