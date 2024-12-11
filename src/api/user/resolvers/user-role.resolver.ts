import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Auth, UserRole, UserRoleCreateInput } from 'src/generated/graphql';

import { FindManyUserRoleArgs } from '../dto';
import { UserRoleService } from '../services';

const PaginatedUserRole = Paginated(UserRole);
/**
 * 用户角色相关操作
 * @group User
 */
@UseGuards(JwtAuthGuard)
@Resolver(() => UserRole)
export class UserRoleResolver {
  constructor(
    private readonly service: UserRoleService,
    private readonly pagination: PaginationService,
  ) {}

  /**
   * 创建用户角色
   * @param auth
   * @param input
   */
  @UsePermission('ADMIN')
  @Mutation(() => UserRole)
  createUserRole(@CurrentAuth({ requireAdmin: true }) auth: Auth, @Args('input') input: UserRoleCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

  /**
   * 查询用户角色列表
   * @param auth
   * @param args
   */
  @UsePermission('ADMIN')
  @Query(() => PaginatedUserRole)
  async findManyUserRole(
    @CurrentAuth({ requireAdmin: true }) auth: Auth,
    @Args(PaginationPipe) args: FindManyUserRoleArgs,
  ) {
    this.service.setAuth(auth);
    return this.service.findManyForPagination(args).then(({ items, count }): IPaginated<UserRole> => {
      const pagination = this.pagination.output(count, args);
      return {
        items,
        pagination,
      };
    });
  }

  /**
   * 更新用户角色
   * @param auth
   * @param input
   * @param id
   */
  @UsePermission('ADMIN')
  @Mutation(() => UserRole)
  updateUserRole(
    @CurrentAuth({ requireAdmin: true }) auth: Auth,
    @Args('input') input: UserRoleCreateInput,
    @Args('id', { type: () => Int }) id: number,
  ) {
    this.service.setAuth(auth);
    return this.service.update(id, input);
  }
}
