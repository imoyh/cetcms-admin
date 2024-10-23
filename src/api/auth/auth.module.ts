import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import * as Guards from './guards';
import * as Strategies from './strategies';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from 'src/config';
import { TokenFactory } from 'src/api/auth/factories/token.factory';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { jwt } = configService.get<typeof AppConfiguration>('app');
        return {
          secret: jwt.secret,
          signOptions: { expiresIn: jwt.expiresIn },
        };
      },
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    TokenFactory,
    ...Object.values(Guards),
    ...Object.values(Strategies),
  ],
})
export class AuthModule {}
