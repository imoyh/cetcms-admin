import { Resolver } from '@nestjs/graphql';
import { AdminRole } from 'src/generated/graphql';

/**
 * 管理员角色操作
 * @group Admin
 */
@Resolver(() => AdminRole)
export class AdminRoleResolverFields {}
