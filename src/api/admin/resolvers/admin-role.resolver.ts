import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { AdminRole, AdminRoleCreateInput, Auth } from 'src/generated/graphql';

import { FindManyAdminRoleArgs } from '../dto';
import { AdminRoleService } from '../services';

const PaginatedAdminRole = Paginated(AdminRole);

@UseGuards(JwtAuthGuard)
@Resolver(() => AdminRole)
export class AdminRoleResolver {
  constructor(
    private readonly service: AdminRoleService,
    private readonly pagination: PaginationService,
  ) {}

  @Mutation(() => AdminRole)
  createAdminRole(@CurrentAuth({ requireAdmin: true }) auth: Auth, @Args('input') input: AdminRoleCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

  @Query(() => PaginatedAdminRole)
  async findManyAdminRole(
    @CurrentAuth({ requireAdmin: true }) auth: Auth,
    @Args(PaginationPipe) args: FindManyAdminRoleArgs,
  ) {
    this.service.setAuth(auth);
    return this.service.findManyForPagination(args).then(({ items, count }): IPaginated<AdminRole> => {
      const pagination = this.pagination.output(count, args);
      return {
        items,
        pagination,
      };
    });
  }

  @Mutation(() => AdminRole)
  updateAdminRole(
    @CurrentAuth({ requireAdmin: true }) auth: Auth,
    @Args('input') input: AdminRoleCreateInput,
    @Args('id', { type: () => Int }) id: number,
  ) {
    this.service.setAuth(auth);
    return this.service.update(id, input);
  }
}
