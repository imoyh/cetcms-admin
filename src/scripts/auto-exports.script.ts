import * as fs from 'fs';
import * as path from 'path';
import process from 'process';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AutoExportsScript {
  constructor() {}
  async run() {
    const graphqlDir = path.resolve(__dirname, '../generated/graphql');
    const dtoDir = path.resolve(__dirname, '../generated/dto');
    const outFile = 'index.ts';

    fs.writeFileSync(path.join(dtoDir, outFile), this.traverseDir(dtoDir, outFile).join('\n') + '\n');
    fs.writeFileSync(path.join(graphqlDir, outFile), this.traverseDir(graphqlDir, outFile).join('\n') + '\n');
  }

  traverseDir(dir: string, outFile = 'index.ts', outDir?: string) {
    const files = fs.readdirSync(dir);
    const exportStatements: string[] = [];
    if (!outDir) outDir = dir;
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (file === outFile) continue;

      if (stats.isDirectory()) {
        exportStatements.push(...this.traverseDir(filePath, outFile, outDir));
      } else if (stats.isFile()) {
        const relativePath = path.relative(outDir, filePath).split('.');
        relativePath.pop();
        const exportStatement = `export * from './${relativePath.join('.').replace(/\\/g, '/')}';`;
        exportStatements.push(exportStatement);
      }
    }
    return exportStatements;
  }
}
// This is the entry point of the application
async function bootstrap() {
  const logger = new Logger(AutoExportsScript.name);
  const script = new AutoExportsScript();
  script.run().then(() => {
    logger.log('Running in external script mode');
    process.exit(0);
  });
}

if (require.main === module) {
  bootstrap().then();
}
