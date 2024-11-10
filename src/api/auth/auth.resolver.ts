import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { CurrentAuth, CurrentClient, CurrentRequest } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth, AuthUserType, Client } from 'src/generated/graphql';

import { AuthService } from './auth.service';
import { AuthTokenInfo } from './entities';

@Resolver()
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
}
