import { Injectable } from '@nestjs/common';
import { AuthTokenInfo, AuthUserType } from '../api.graphql';
import { Admin, Client, User } from '@prisma/client';
import { pickUserTypeInClient } from 'src/helpers/client';
import { TokenFactory } from 'src/api/auth/factories/token.factory';
import { AuthInput } from 'src/prisma/inputs';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenFactory: TokenFactory,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async loginWithEmail(
    email: string,
    password: string,
    client: Client,
    type?: AuthUserType,
  ) {
    type = pickUserTypeInClient(type, client);
    const { jwt } = this.configService.get<typeof AppConfiguration>('app');

    let user: User;
    let admin: Admin;
    if (type === AuthUserType.USER) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    }
    if (type === AuthUserType.ADMIN) {
      admin = await this.prisma.admin.findUnique({
        where: { email },
      });
    }

    const nowDate = new Date();
    const expiresInValue = parseInt(jwt.expiresIn);
    const expiresInUnit = jwt.expiresIn.replace(
      /[0-9]/g,
      '',
    ) as dayjs.ManipulateType;
    const authInput = AuthInput.create({
      token: '',
      tokenEnabledAt: new Date(),
      tokenCreatedAt: new Date(),
      tokenExpiresAt: dayjs(nowDate)
        .add(expiresInValue, expiresInUnit)
        .toDate(),

      admin: admin ? { connect: { id: admin.id } } : undefined,
      user: user ? { connect: { id: user.id } } : undefined,
      client: { connect: { id: client.id } },
    });

    const tokenInfo = this.tokenFactory.createToken(
      {
        iss: type,
        sub: String(type === AuthUserType.USER ? user.id : admin.id),
        aud: client.uuid,
        nbf: new Date(authInput.tokenEnabledAt).getTime() / 1000,
        iat: new Date(authInput.tokenCreatedAt).getTime() / 1000,
        jti: authInput.uuid,
      },
      jwt.secret,
      jwt.expiresIn,
    );
    authInput.token = tokenInfo.token;
    const authInfo = await this.prisma.auth.create({ data: authInput });
    const result: AuthTokenInfo = {
      accessToken: authInfo.token,
      accessTokenExpiresAt: Math.ceil(
        (authInfo.tokenExpiresAt.getTime() - nowDate.getTime()) / 1000,
      ),
      refreshToken: '',
      refreshTokenExpiresAt: 0,
      tokenType: 'Bearer',
    };
    return result;
  }

  logout(id?: string) {
    return Boolean(id);
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
}
