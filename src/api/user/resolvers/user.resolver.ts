import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/common/decorators';
import { IPaginated, Paginated } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import { PaginationService } from 'src/common/services';
import { Auth, User, UserCreateInput } from 'src/generated/graphql';

import { FindManyUserArgs } from '../dto';
import { UserService } from '../services';

const PaginatedUser = Paginated(User);

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly service: UserService,
    private readonly pagination: PaginationService,
  ) {}

  @Mutation(() => User)
  createUser(@CurrentAuth({ required: true }) auth: Auth, @Args('input') input: UserCreateInput) {
    this.service.setAuth(auth);
    return this.service.create(input);
  }

  @Query(() => PaginatedUser)
  async findManyUser(@CurrentAuth({ required: true }) auth: Auth, @Args(PaginationPipe) args: FindManyUserArgs) {
    this.service.setAuth(auth);
    return this.service.findManyForPagination(args).then(({ items, count }): IPaginated<User> => {
      const pagination = this.pagination.output(count, args);
      return {
        items,
        pagination,
      };
    });
  }

  @Mutation(() => User)
  updateUser(
    @CurrentAuth({ required: true }) auth: Auth,
    @Args('input') input: UserCreateInput,
    @Args('id', { type: () => Int }) id: number,
  ) {
    this.service.setAuth(auth);
    return this.service.update(id, input);
  }
}
