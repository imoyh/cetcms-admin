import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthTokenInfo {
  @Field(() => String)
  accessToken: string;

  @Field(() => Number)
  accessTokenExpiresAt: number;

  @Field(() => String)
  refreshToken: string;

  @Field(() => Number)
  refreshTokenExpiresAt: number;

  @Field(() => String)
  tokenType: string;
}
