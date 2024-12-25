import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FindManyAdminArgs } from 'src/api/admin/dto';
import { AuthMixin } from 'src/common/interfaces';
import { Admin, AdminCreateInput, Auth } from 'src/generated/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService implements AuthMixin {
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

  create(input: AdminCreateInput) {
    return 'This action adds a new admin';
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async findMany(args: Prisma.AdminFindManyArgs) {
    const { take, skip, where, orderBy, include } = args;
    return Promise.all([
      this.prisma.admin.count({ where }),
      this.prisma.admin.findMany({
        where,
        orderBy,
        include,
        take: Math.abs(take),
        skip: Math.abs(skip),
      }),
    ]).then(([count, items]) => {
      return { count: Number(count), items: items as unknown as Admin[] };
    });
  }

  async findManyForPagination(args: FindManyAdminArgs) {
    return this.findMany({
      where: args.where,
      take: Math.abs(args.limit),
      skip: Math.abs(args.limit * (args.page - 1)),
      orderBy: args.orderBy,
      include: {
        role: true,
      },
    });
  }

  update(id: number, input: AdminCreateInput) {
    return `This action updates a #${id} admin`;
  }
}
