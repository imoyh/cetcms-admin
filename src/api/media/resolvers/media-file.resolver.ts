import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { CurrentAuth, UsePermission } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Auth, MediaFile, MediaFileCreateInput } from 'src/generated/graphql';

import { FindManyFileArgs } from '../dto';
import { MediaFileService } from '../services';

const PaginatedMediaFile = Paginated(MediaFile);

/**
 * 媒体文件管理
 * @group Media
 */
@UseGuards(JwtAuthGuard)
@Resolver(() => MediaFile)
export class MediaFileResolver {
  constructor(
    private readonly service: MediaFileService,
    private readonly pagination: PaginationService,
  ) {}

  /**
   * 创建媒体文件
   * @param auth
   * @param input
   */
  @UsePermission('ADMIN', 'USER')
  @Mutation(() => MediaFile)
  createMediaFile(@CurrentAuth() auth: Auth, @Args('input') input: MediaFileCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

  /**
   * 上传媒体文件
   * @param uuid
   * @param file
   */
  @UsePermission('ADMIN', 'USER')
  @Mutation(() => MediaFile)
  uploadMediaFile(
    @Args('uuid', { type: () => String }) uuid: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.service.upload(uuid, file);
  }

  /**
   * 查询媒体文件列表
   * @param auth
   * @param args
   */
  @UsePermission('ADMIN', 'USER')
  @Query(() => PaginatedMediaFile)
  async findManyMediaFile(@CurrentAuth() auth: Auth, @Args(PaginationPipe) args: FindManyFileArgs) {
    this.service.setAuth(auth);
    return this.service.findItemsByPath(args).then(({ items, count }): IPaginated<MediaFile> => {
      const pagination = this.pagination.output(count, args);
      return {
        items,
        pagination,
      };
    });
  }

  @ResolveField(() => String)
  async url(@Parent() media: MediaFile) {
    return `http://localhost:3325/media${media.path}${media.fileName}`;
  }
}
