import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/common/guards';
import { MediaFile } from 'src/generated/graphql';

/**
 * 媒体文件管理
 * @group Media
 */
@UseGuards(JwtAuthGuard)
@Resolver(() => MediaFile)
export class MediaFileResolverFields {
  @ResolveField(() => String)
  async url(@Parent() media: MediaFile) {
    return `http://localhost:3325/media${media.path}${media.fileName}`;
  }
}
