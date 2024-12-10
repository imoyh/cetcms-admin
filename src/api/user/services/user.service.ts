import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FindManyUserArgs } from 'src/api/user/dto';
import { AuthMixin } from 'src/common/interfaces';
import { Auth, UserCreateInput } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService implements AuthMixin {
  private auth: Auth;

  constructor(private readonly prisma: PrismaService) {}

  setAuth(auth: Auth) {
    return (this.auth = auth);
  }

  getAuth() {
    if (!this.auth) {
      throw new ForbiddenException('Not authorized');
    } else {
      return this.auth;
    }
  }

  create(input: UserCreateInput) {
    return 'This action adds a new user';
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findMany(args: Prisma.UserFindManyArgs) {
    const { take, skip, where, orderBy, include } = args;
    return Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy,
        include,
        take: Math.abs(take),
        skip: Math.abs(skip),
      }),
    ]).then(([count, items]) => {
      return { count, items };
    });
  }

  async findManyForPagination(args: FindManyUserArgs) {
    return this.findMany({
      where: args.where,
      take: Math.abs(args.limit),
      skip: Math.abs(args.limit * (args.page - 1)),
      orderBy: args.orderBy,
    });
  }

  update(id: number, input: UserCreateInput) {
    return `This action updates a #${id} user`;
  }
}
