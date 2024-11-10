import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, registerAs } from '@nestjs/config';

import { AppConfiguration } from './definition/app.configuration';
import { DatabaseConfiguration } from './definition/database.configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [registerAs('app', () => AppConfiguration), registerAs('database', () => DatabaseConfiguration)],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
