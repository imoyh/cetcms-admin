import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { CurrentAuth } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth, Media, MediaCreateInput } from 'src/generated/graphql';
import { trim } from 'voca';

import { MediaService } from './media.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Media)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => Media)
  createMedia(@Args('input') input: MediaCreateInput, @CurrentAuth() auth: Auth) {
    return this.mediaService.create(input, auth);
  }

  @Mutation(() => Media)
  uploadMedia(
    @Args('uuid', { type: () => String }) uuid: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.mediaService.upload(uuid, file);
  }

  @ResolveField(() => String)
  async url(@Parent() media: Media) {
    return `http://localhost:3325/media/${trim(media.urlPath, '/')}`;
  }
}
