import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import * as Inputs from './inputs';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'prisma/schema.graphql'),
      sortSchema: true,
    }),
  ],
  providers: [PrismaService, ...Object.values(Inputs)],
  exports: [PrismaService, ...Object.values(Inputs)],
})
export class PrismaModule {}
