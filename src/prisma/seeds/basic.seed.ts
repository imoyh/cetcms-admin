import { Logger } from '@nestjs/common';
import { AdminInput, AdminRoleInput, ClientInput, ClientMenuInput, UserInput, UserRoleInput } from 'src/prisma/inputs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoUtil } from 'src/utils/features';

const logger = new Logger('BasicSeed');

export const BasicSeed = async (prisma: PrismaService) => {
  const adminRole = AdminRoleInput.create({
    name: 'ROOT',
    alias: '根管理員',
    description: 'Root system administrator role',
  });
  const userRole = UserRoleInput.create({
    name: 'MAIN',
    alias: '主账户',
    description: 'Main user role',
  });
  const admin = AdminInput.create({
    email: 'admin@mail.com',
    firstName: 'Admin',
    lastName: 'User',
    password: CryptoUtil.hashPassword('admin123'),
    role: { connect: { name: adminRole.name } },
  });
  const user = UserInput.create({
    email: 'user@mail.com',
    firstName: 'Hao',
    lastName: 'OuYang',
    password: CryptoUtil.hashPassword('user123'),
    role: { connect: { name: userRole.name } },
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
  const [adminRoleResult, userRoleResult, adminResult, userResult, adminClientResult, userClientResult] =
    await prisma.$transaction([
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

  const clientMenuAdmin = ClientMenuInput.create({
    name: 'ADMIN_PANEL',
    label: 'Admin Panel',
    client: { connect: { id: adminClientResult.id } },
  });

  const clientMenuAdminResult = await prisma.clientMenu.create({
    data: clientMenuAdmin,
  });

  const clientMenuSub1 = ClientMenuInput.create({
    label: 'Home',
    icon: 'IconHome2',
    parent: { connect: { id: clientMenuAdminResult.id } },
    children: {
      createMany: {
        data: [
          {
            label: 'Home',
            url: '/',
          },
        ],
      },
    },
  });

  const clientMenuSub2 = ClientMenuInput.create({
    label: 'Dashboard',
    icon: 'IconGauge',
    parent: { connect: { id: clientMenuAdminResult.id } },
    children: {
      createMany: {
        data: [
          {
            label: 'Dashboard',
            url: '/dashboard',
          },
          {
            label: 'Models',
            url: '/data/models',
          },
          {
            label: 'Pages',
            url: '/pages',
          },
          {
            label: 'Menus',
            url: '/menus',
          },
          {
            label: 'Templates',
            url: '/templates',
          },
          {
            label: 'Media',
            url: '/media',
          },
        ],
      },
    },
  });

  const clientMenuSub3 = ClientMenuInput.create({
    label: 'Settings',
    icon: 'IconSettings',
    parent: { connect: { id: clientMenuAdminResult.id } },
    children: {
      createMany: {
        data: [
          {
            label: 'Application',
            url: '/application',
          },
          {
            label: 'Admin',
            url: '/admin',
          },
          {
            label: 'Roles',
            url: '/roles',
          },
          {
            label: 'Log',
            url: '/logs',
          },
          {
            label: 'Translates',
            url: '/translate',
          },
          {
            label: 'Cascaded',
            url: '/cascaded',
          },
        ],
      },
    },
  });

  const menus = await prisma.$transaction([
    prisma.clientMenu.create({ data: clientMenuSub1 }),
    prisma.clientMenu.create({ data: clientMenuSub2 }),
    prisma.clientMenu.create({ data: clientMenuSub3 }),
  ]);

  logger.debug(`Created client menu with Name: ${clientMenuAdminResult.name}`);
  logger.debug(`Created client menu with Name: ${menus[0].id}`);
  logger.debug(`Created client menu with Name: ${menus[1].id}`);
  logger.debug(`Created client menu with Name: ${menus[2].id}`);
  logger.debug(menus);
};
