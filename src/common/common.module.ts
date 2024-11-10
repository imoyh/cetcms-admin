import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfiguration } from 'src/config';

import * as Factories from './factories';
import * as Guards from './guards';
import * as Pipes from './pipes';
import * as Strategies from './strategies';

@Global()
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
    ...Object.values(Guards),
    ...Object.values(Strategies),
    ...Object.values(Factories),
    ...Object.values(Pipes),
  ],
  exports: [
    ...Object.values(Guards),
    ...Object.values(Strategies),
    ...Object.values(Factories),
    ...Object.values(Pipes),
  ],
})
export class CommonModule {}
