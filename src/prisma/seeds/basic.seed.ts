import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoUtil } from 'src/utils/features';
import { Logger } from '@nestjs/common';
import {
  AdminInput,
  AdminRoleInput,
  ClientInput,
  UserInput,
  UserRoleInput,
} from 'src/prisma/inputs';

const logger = new Logger('BasicSeed');

export const BasicSeed = async (prisma: PrismaService) => {
  const adminRole = AdminRoleInput.create({
    name: 'Root',
    displayName: '根管理員',
    description: 'Root system administrator role',
  });
  const userRole = UserRoleInput.create({
    name: 'Main',
    displayName: '主账户',
    description: 'Main user role',
  });
  const admin = AdminInput.create({
    email: 'admin@mail.com',
    firstName: 'Admin',
    lastName: 'User',
    password: CryptoUtil.hashPassword('admin123'),
    role: { connect: { id: 1 } },
  });
  const user = UserInput.create({
    email: 'user@mail.com',
    firstName: 'Hao',
    lastName: 'OuYang',
    password: CryptoUtil.hashPassword('user123'),
    role: { connect: { id: 1 } },
  });
  const adminClient = ClientInput.create({
    name: 'ADMIN_PANEL',
    title: 'Admin Panel',
    description: '',
    url: 'http://localhost:6685',
    allowAdminAuth: true,
    allowUserAuth: false,
    isEnabled: true,
    isTesting: true,
  });
  const userClient = ClientInput.create({
    name: 'USER_PANEL',
    title: 'User Panel',
    description: '',
    url: 'http://localhost:6686',
    allowAdminAuth: false,
    allowUserAuth: true,
    isEnabled: true,
    isTesting: true,
  });
  const [
    adminRoleResult,
    userRoleResult,
    adminResult,
    userResult,
    adminClientResult,
    userClientResult,
  ] = await prisma.$transaction([
    prisma.adminRole.upsert({
      where: { name: adminRole.name },
      create: adminRole,
      update: adminRole,
    }),
    prisma.userRole.upsert({
      where: { name: userRole.name },
      create: userRole,
      update: userRole,
    }),
    prisma.admin.upsert({
      where: { email: admin.email },
      create: admin,
      update: admin,
    }),
    prisma.user.upsert({
      where: { email: user.email },
      create: user,
      update: user,
    }),
    prisma.client.upsert({
      where: { name: adminClient.name },
      create: adminClient,
      update: adminClient,
    }),
    prisma.client.upsert({
      where: { name: userClient.name },
      create: userClient,
      update: userClient,
    }),
  ]);

  logger.debug(`Created admin role with Name: ${adminRoleResult.name}`);
  logger.debug(`Created admin user with Email: ${adminResult.email}`);
  logger.debug(`Created user role with Name: ${userRoleResult.name}`);
  logger.debug(`Created user with Email: ${userResult.email}`);
  logger.debug(`Created client with Name: ${adminClientResult.name}`);
  logger.debug(`Created client with Name: ${userClientResult.name}`);
};
