import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Admin } from 'src/generated/graphql';

@Resolver(() => Admin)
export class AdminResolverFields {
  @ResolveField('avatarUrl', () => String, { nullable: true })
  async avatarUrl() {
    return 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png';
  }

  @ResolveField('fullName', () => String, { nullable: true })
  async fullName(@Root() admin: Admin) {
    const names = [];
    if (admin.firstName) names.push(admin.firstName);
    if (admin.lastName) names.push(admin.lastName);
    return names.join(' ');
  }

  @ResolveField('phone', () => String, { nullable: true })
  async phone() {
    return '(+86) 13800138000';
  }
}
