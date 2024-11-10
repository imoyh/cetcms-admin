import { join } from 'path';
import * as process from 'process';

import { Injectable, Logger } from '@nestjs/common';
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';

@Injectable()
export class GenerateGraphQLDefinitionsScript {
  private readonly logger = new Logger(GenerateGraphQLDefinitionsScript.name);
  constructor() {}

  async run(isWatch = false) {
    const definitionsFactory = new GraphQLDefinitionsFactory();
    await definitionsFactory.generate({
      typePaths: [join(process.cwd(), 'src/api/**/*.graphql')],
      path: join(process.cwd(), 'src/api/api.graphql.ts'),
      watch: isWatch,
    });

    this.logger.log('GraphQL definitions generated successfully');
  }
}
// This is the entry point of the application
async function bootstrap() {
  const isWatch = process.argv.includes('--watch');
  const logger = new Logger(GenerateGraphQLDefinitionsScript.name);
  const script = new GenerateGraphQLDefinitionsScript();
  script.run(isWatch).then(() => {
    logger.log('Running in external script mode');
    if (!isWatch) process.exit(0);
  });
}

if (require.main === module) {
  bootstrap().then();
}
