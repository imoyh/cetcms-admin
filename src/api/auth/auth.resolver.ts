import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Request } from 'express';
import { CurrentAuth, CurrentClient, CurrentRequest } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth, AuthUserType, Client } from 'src/generated/graphql';

import { AuthService } from './auth.service';
import { AuthTokenInfo } from './entities';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthTokenInfo)
  loginWithEmail(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('type', { type: () => AuthUserType, nullable: true })
    type: AuthUserType,
    @CurrentClient({ required: true }) client: Client,
    @CurrentRequest() request: Request,
  ) {
    return this.authService.loginWithEmail(email, password, client, type, request);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  logout(@Args('id', { nullable: true }) id: string, @CurrentAuth() auth: Auth) {
    return this.authService.logout(auth, id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => AuthTokenInfo)
  refreshToken(
    @Args('id', { nullable: true }) id: string,
    @CurrentAuth() auth: Auth,
    @CurrentClient({ required: true }) client: Client,
    @CurrentRequest() request: Request,
  ) {
    return this.authService.refreshToken(client, auth, request);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Auth)
  authInfo(@CurrentAuth({ required: true }) auth: Auth) {
    return auth;
  }

  @ResolveField('email', () => String, { nullable: true })
  async email(@Root() auth: Auth) {
    return auth.admin?.email || auth.user?.email || '';
  }

  @ResolveField('fullName', () => String, { nullable: true })
  async fullName(@Root() auth: Auth) {
    if (auth.admin) {
      return auth.admin.firstName + ' ' + auth.admin.lastName;
    } else if (auth.user) {
      return auth.user.firstName + ' ' + auth.user.lastName;
    } else {
      return '';
    }
  }

  @ResolveField('avatarUrl', () => String, { nullable: true })
  async avatarUrl() {
    return 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png';
  }
}
