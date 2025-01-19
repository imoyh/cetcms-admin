import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FindManyAdminRoleArgs } from 'src/api/admin/dto';
import { AuthTool } from 'src/common/tools';
import { AdminRoleCreateInput, Auth } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminRoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthTool,
  ) {}

  setAuth(auth: Auth) {
    this.auth.set(auth);
  }

  create(input: AdminRoleCreateInput) {
    return 'This action adds a new admin';
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async findMany(args: Prisma.AdminRoleFindManyArgs) {
    this.auth.get();
    const { take, skip, where, orderBy, include } = args;
    return Promise.all([
      this.prisma.adminRole.count({ where }),
      this.prisma.adminRole.findMany({
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

  async findManyForPagination(args: FindManyAdminRoleArgs) {
    return this.findMany({
      where: args.where,
      take: Math.abs(args.limit),
      skip: Math.abs(args.limit * (args.page - 1)),
      orderBy: args.orderBy,
      include: {
        permissions: true,
      },
    });
  }

  update(id: number, input: AdminRoleCreateInput) {
    return `This action updates a #${id} admin`;
  }
}
