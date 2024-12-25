import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Auth } from 'src/generated/graphql';

@Resolver(() => Auth)
export class AuthResolverFields {
  @ResolveField('email', () => String, { nullable: true })
  async email(@Root() auth: Auth) {
    return auth.admin?.email || auth.user?.email || '';
  }

  @ResolveField('fullName', () => String, { nullable: true })
  async fullName(@Root() auth: Auth) {
    const names = [];
    if (auth.admin) {
      names.push(auth.admin.firstName);
      names.push(auth.admin.lastName);
    } else if (auth.user) {
      names.push(auth.user.firstName);
      names.push(auth.user.lastName);
    }
    return names.join(' ');
  }

  @ResolveField('avatarUrl', () => String, { nullable: true })
  async avatarUrl(@Root() auth: Auth) {
    return (
      auth.admin?.avatar?.url ||
      auth.user?.avatar?.url ||
      'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png'
    );
  }
}
