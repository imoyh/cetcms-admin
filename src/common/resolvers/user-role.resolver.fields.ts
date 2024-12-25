import { Resolver } from '@nestjs/graphql';
import { UserRole } from 'src/generated/graphql';

/**
 * 用户角色相关操作
 * @group User
 */
@Resolver(() => UserRole)
export class UserRoleResolverFields {}
