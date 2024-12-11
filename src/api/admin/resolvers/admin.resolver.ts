import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Admin, AdminCreateInput, Auth } from 'src/generated/graphql';

import { FindManyAdminArgs } from '../dto';
import { AdminService } from '../services';

const PaginatedAdmin = Paginated(Admin);

/**
 * 管理员相关操作
 * @group Admin
 */
@UseGuards(JwtAuthGuard)
@Resolver(() => Admin)
export class AdminResolver {
  constructor(
    private readonly service: AdminService,
    private readonly pagination: PaginationService,
  ) {}

  /**
   * 创建管理员
   * @param auth
   * @param input
   */
  @UsePermission('ADMIN')
  @Mutation(() => Admin)
  createAdmin(@CurrentAuth({ requireAdmin: true }) auth: Auth, @Args('input') input: AdminCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

  /**
   * 查询管理员列表
   * @param auth
   * @param args
   */
  @UsePermission('ADMIN')
  @Query(() => PaginatedAdmin)
  async findManyAdmin(@CurrentAuth({ requireAdmin: true }) auth: Auth, @Args(PaginationPipe) args: FindManyAdminArgs) {
    this.service.setAuth(auth);
    return this.service.findManyForPagination(args).then(({ items, count }): IPaginated<Admin> => {
      const pagination = this.pagination.output(count, args);
      return {
        items,
        pagination,
      };
    });
  }

  /**
   * 更新管理员资料
   * @param auth
   * @param input
   * @param id
   */
  @UsePermission('ADMIN')
  @Mutation(() => Admin)
  updateAdmin(
    @CurrentAuth({ requireAdmin: true }) auth: Auth,
    @Args('input') input: AdminCreateInput,
    @Args('id', { type: () => Int }) id: number,
  ) {
    this.service.setAuth(auth);
    return this.service.update(id, input);
  }
}
