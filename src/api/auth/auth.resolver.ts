import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUserType } from 'src/api/api.graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { JwtAuthGuard } from './guards';
import { UseGuards } from '@nestjs/common';
import { CurrentClient } from 'src/api/auth/decorators/current-client.decorator';
import { Client } from '@prisma/client';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('loginWithEmail')
  loginWithEmail(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('type') type: AuthUserType,
    @CurrentClient({ required: true }) client: Client,
  ) {
    return this.authService.loginWithEmail(email, password, client, type);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('logout')
  logout(@Args('id') id?: string) {
    return this.authService.logout(id);
  }

  @Query('auth')
  findOne(@Args('id') id: number) {
    return this.authService.findOne(id);
  }
}
