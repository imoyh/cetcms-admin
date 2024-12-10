import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindFolderWhereInput, FindManyFolderArgs } from 'src/api/media/dto';
import { CurrentAuth } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Auth, MediaFile, MediaFolder, MediaStoreType } from 'src/generated/graphql';

import { MediaFolderService } from '../services';

const PaginatedMediaFolder = Paginated(MediaFolder);

@UseGuards(JwtAuthGuard)
@Resolver(() => MediaFile)
export class MediaFolderResolver {
  constructor(
    private readonly service: MediaFolderService,
    private readonly pagination: PaginationService,
  ) {}

  @Query(() => PaginatedMediaFolder)
  async findManyMediaFolder(@CurrentAuth() auth: Auth, @Args(PaginationPipe) args: FindManyFolderArgs) {
    this.service.setAuth(auth);
    return this.service.findItemsByPath(args).then(({ items, count }): IPaginated<MediaFolder> => {
      const pagination = this.pagination.output(count, args);
      return {
        items,
        pagination,
      };
    });
  }

  @Query(() => MediaFolder)
  findStoreFolderTree(@CurrentAuth() auth: Auth, @Args('store', { type: () => MediaStoreType }) store: MediaStoreType) {
    this.service.setAuth(auth);
    return this.service.findTreeByStore(store);
  }

  @Mutation(() => MediaFolder)
  createMediaFolder(@CurrentAuth() auth: Auth, @Args('input') input: FindFolderWhereInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }
}
