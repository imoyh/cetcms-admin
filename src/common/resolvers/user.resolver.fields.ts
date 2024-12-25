import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { User } from 'src/generated/graphql';

/**
 * 用户相关操作
 * @group User
 */
@Resolver(() => User)
export class UserResolverFields {
  @ResolveField('avatarUrl', () => String, { nullable: true })
  async avatarUrl() {
    return 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png';
  }

  @ResolveField('fullName', () => String, { nullable: true })
  async fullName(@Root() user: User) {
    const names = [];
    if (user.firstName) names.push(user.firstName);
    if (user.lastName) names.push(user.lastName);
    return names.join(' ');
  }

  @ResolveField('phone', () => String, { nullable: true })
  async phone() {
    return '(+86) 13800138000';
  }
}
