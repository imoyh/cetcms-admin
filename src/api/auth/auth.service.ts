import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthTokenInfo, AuthUserType } from '../api.graphql';
import { Admin, Auth, Client, User } from '@prisma/client';
import { pickUserTypeInClient } from 'src/helpers/client';
import { TokenFactory } from 'src/api/auth/factories/token.factory';
import { AuthInput } from 'src/prisma/inputs';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import dayjs, { ManipulateType } from 'dayjs';
import getClientIp from 'get-client-ip';
import { CryptoUtil } from 'src/utils/features';

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
    request?: Request,
  ) {
    type = pickUserTypeInClient(type, client);
    const { user, admin } = await this.validateUser(email, password, type);

    await this.cleanAuths(client, user, admin);

    return this.createAuthInfo(client, request, type, user, admin);
  }

  async logout(auth: Auth, logoutOtherAuthId?: string | bigint | number) {
    if (logoutOtherAuthId && !auth.adminId) {
      throw new ForbiddenException({
        message: 'Only admin can logout other users',
      });
    }
    const authId = logoutOtherAuthId || auth.id;
    const result = await this.prisma.auth.delete({
      where: typeof authId === 'string' ? { uuid: authId } : { id: authId },
    });
    return Boolean(result);
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  /**
   * 验证用户信息
   * @param email
   * @param password
   * @param type
   * @private
   */
  private async validateUser(
    email: string,
    password: string,
    type: AuthUserType,
  ) {
    let user: User | undefined;
    let admin: Admin | undefined;
    if (type === AuthUserType.USER) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } else if (type === AuthUserType.ADMIN) {
      admin = await this.prisma.admin.findUnique({
        where: { email },
      });
    }
    const hashPassword = user?.password || admin?.password;
    if (!hashPassword || !CryptoUtil.checkPassword(password, hashPassword)) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }
    return { user, admin };
  }

  /**
   * 清理过期的授权信息
   * @param client
   * @param user
   * @param admin
   * @private
   */
  private async cleanAuths(client: Client, user?: User, admin?: Admin) {
    const auths = await this.prisma.auth.findMany({
      orderBy: { tokenExpiresAt: 'asc' },
      where: { clientId: client.id, userId: user?.id, adminId: admin?.id },
    });
    const cleanCount = auths.length - client.maxAuthCount + 1;
    if (cleanCount >= 0) {
      const cleanAuths = auths.splice(0, cleanCount);
      await this.prisma.auth.deleteMany({
        where: {
          OR: [
            { id: { in: cleanAuths.map((auth) => auth.id) } },
            { tokenExpiresAt: { lt: new Date() } },
          ],
        },
      });
      return cleanAuths;
    }
    return [];
  }

  /**
   * 创建授权信息
   * @param client
   * @param request
   * @param type
   * @param user
   * @param admin
   * @private
   */
  private async createAuthInfo(
    client: Client,
    request: Request,
    type: AuthUserType,
    user?: User,
    admin?: Admin,
  ) {
    const { jwt } = this.configService.get<typeof AppConfiguration>('app');
    const clientIp = getClientIp(request);
    const expireValue = parseInt(jwt.expiresIn);
    const expireUnit = jwt.expiresIn.replace(/[0-9]/g, '') as ManipulateType;
    const nowDate = new Date();
    const tokenExpiresAt = dayjs(nowDate).add(expireValue, expireUnit).toDate();
    const tokenCreatedAt = new Date();
    const tokenEnabledAt = new Date();
    const expiresTime = tokenExpiresAt.getTime() - nowDate.getTime();
    const authInput = AuthInput.create({
      token: '',
      tokenEnabledAt: tokenEnabledAt,
      tokenCreatedAt: tokenCreatedAt,
      tokenExpiresAt: tokenExpiresAt,
      loginIp: clientIp,
      admin: admin ? { connect: { id: admin.id } } : undefined,
      user: user ? { connect: { id: user.id } } : undefined,
      client: { connect: { id: client.id } },
    });
    const tokenInfo = this.tokenFactory.createToken(
      {
        iss: type,
        aud: client.uuid,
        sub: String(type === AuthUserType.USER ? user.id : admin.id),
        nbf: tokenEnabledAt.getTime() / 1000,
        iat: tokenCreatedAt.getTime() / 1000,
        jti: authInput.uuid,
      },
      jwt.secret,
      jwt.expiresIn,
    );
    authInput.token = tokenInfo.token;
    const authInfo = await this.prisma.auth.create({ data: authInput });
    const result: AuthTokenInfo = {
      accessToken: authInfo.token,
      accessTokenExpiresAt: Math.ceil(expiresTime / 1000),
      refreshToken: '',
      refreshTokenExpiresAt: 0,
      tokenType: 'Bearer',
    };
    return result;
  }
}
