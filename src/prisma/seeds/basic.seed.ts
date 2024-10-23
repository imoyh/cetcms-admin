import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoUtil } from 'src/utils/features';
import { Logger } from '@nestjs/common';
import { ClientInput } from 'src/prisma/inputs';
import { AdminInput } from 'src/prisma/inputs/admin.input';
import { AdminRoleInput } from 'src/prisma/inputs/admin-role.input';

const logger = new Logger('BasicSeed');

export const BasicSeed = async (prisma: PrismaService) => {
  const adminRole = AdminRoleInput.create({
    name: 'Root',
    displayName: '根管理員',
    description: 'Root system administrator role',
  });
  const adminRoleResult = await prisma.adminRole.upsert({
    where: { id: 1 },
    create: adminRole,
    update: adminRole,
  });

  const admin = AdminInput.create({
    email: 'admin@mail.com',
    firstName: 'Admin',
    lastName: 'User',
    password: CryptoUtil.hashPassword('admin123'),
    role: { connect: { id: adminRoleResult.id } },
  });
  const adminResult = await prisma.admin.upsert({
    where: { id: 1 },
    create: admin,
    update: admin,
  });

  const client = ClientInput.create({
    name: 'ADMIN_PANEL',
    title: 'Admin Panel',
    description: '',
    url: 'http://localhost:6685',
    allowAdminAuth: true,
    allowUserAuth: false,
    isEnabled: true,
    isTesting: true,
  });

  const clientResult = await prisma.client.upsert({
    where: { id: 1 },
    create: client,
    update: client,
  });

  logger.debug(`Created admin role with Name: ${adminRoleResult.name}`);
  logger.debug(`Created admin user with Email: ${adminResult.email}`);
  logger.debug(`Created client with Name: ${clientResult.name}`);
};
