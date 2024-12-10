import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Auth, UserRole, UserRoleCreateInput } from 'src/generated/graphql';

import { FindManyUserRoleArgs } from '../dto';
import { UserRoleService } from '../services';

const PaginatedUserRole = Paginated(UserRole);

@UseGuards(JwtAuthGuard)
@Resolver(() => UserRole)
export class UserRoleResolver {
  constructor(
    private readonly service: UserRoleService,
    private readonly pagination: PaginationService,
  ) {}

  @Mutation(() => UserRole)
  createUserRole(@CurrentAuth({ required: true }) auth: Auth, @Args('input') input: UserRoleCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

  @Query(() => PaginatedUserRole)
  async findManyUserRole(
    @CurrentAuth({ required: true }) auth: Auth,
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

  @Mutation(() => UserRole)
  updateUserRole(
    @CurrentAuth({ required: true }) auth: Auth,
    @Args('input') input: UserRoleCreateInput,
    @Args('id', { type: () => Int }) id: number,
  ) {
    this.service.setAuth(auth);
    return this.service.update(id, input);
  }
}
