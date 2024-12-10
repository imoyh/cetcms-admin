import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Admin, AdminCreateInput, Auth } from 'src/generated/graphql';

import { FindManyAdminArgs } from '../dto';
import { AdminService } from '../services';

const PaginatedAdmin = Paginated(Admin);

@UseGuards(JwtAuthGuard)
@Resolver(() => Admin)
export class AdminResolver {
  constructor(
    private readonly service: AdminService,
    private readonly pagination: PaginationService,
  ) {}

  @Mutation(() => Admin)
  createAdmin(@CurrentAuth({ requireAdmin: true }) auth: Auth, @Args('input') input: AdminCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

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
