import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUserType } from 'src/api/api.graphql';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { UseGuards } from '@nestjs/common';
import { Client } from '@prisma/client';
import { Request } from 'express';
import {
  CurrentAuth,
  CurrentAuthResult,
  CurrentClient,
  CurrentRequest,
} from './decorators';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('loginWithEmail')
  loginWithEmail(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('type') type: AuthUserType,
    @CurrentClient({ required: true }) client: Client,
    @CurrentRequest() request: Request,
  ) {
    return this.authService.loginWithEmail(
      email,
      password,
      client,
      type,
      request,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('logout')
  logout(@CurrentAuth() auth: CurrentAuthResult, @Args('id') id?: string) {
    return this.authService.logout(auth, id);
  }

  @Query('auth')
  findOne(@Args('id') id: number) {
    return this.authService.findOne(id);
  }
}
