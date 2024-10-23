import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const { jwt } = config.get<typeof AppConfiguration>('app');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const authInfo = await this.prisma.auth.findUnique({
      where: { uuid: payload.jti },
      include: {
        client: true,
        user: { include: { role: true } },
        admin: { include: { role: true } },
      },
    });
    if (!authInfo) {
      throw new UnauthorizedException({
        message: 'Invalid token',
      });
    }
    return authInfo;
  }
}
