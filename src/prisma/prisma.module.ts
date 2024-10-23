import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import * as Inputs from './inputs';
import { join } from 'path';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(process.cwd(), 'src/api/**/*.graphql')],
    }),
  ],
  providers: [PrismaService, ...Object.values(Inputs)],
  exports: [PrismaService, ...Object.values(Inputs)],
})
export class PrismaModule {}
