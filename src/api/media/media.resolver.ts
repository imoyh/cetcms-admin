import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { CurrentAuth } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth, MediaFile, MediaFileCreateInput } from 'src/generated/graphql';
import { trim } from 'voca';

import { Folder } from './entities/media.entity';
import { MediaService } from './media.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => MediaFile)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => MediaFile)
  createMediaFile(@Args('input') input: MediaFileCreateInput, @CurrentAuth() auth: Auth) {
    return this.mediaService.createFile(input, auth);
  }

  @Mutation(() => MediaFile)
  uploadMediaFile(
    @Args('uuid', { type: () => String }) uuid: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.mediaService.uploadFile(uuid, file);
  }

  @Query(() => [Folder])
  async folders(@Args('parent', { type: () => String, nullable: true }) parent: string) {
    return this.mediaService.findFolders();
  }

  @Query(() => MediaFile)
  media(@Args('id', { type: () => String }) id: string) {
    return this.mediaService.findOne(id);
  }

  @Query(() => [MediaFile])
  async medias() {
    return this.mediaService.findAll();
  }

  @ResolveField(() => String)
  async url(@Parent() media: MediaFile) {
    return `http://localhost:3325/media/${trim(media.path, '/')}`;
  }
}
