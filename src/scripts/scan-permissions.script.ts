import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'process';

import { Injectable, Logger } from '@nestjs/common';
import prettier from 'prettier';
import { PermissionInfo } from 'src/api/permission/entities';
import { Project } from 'ts-morph';
import voca from 'voca';

@Injectable()
export class ScanPermissionsScript {
  private readonly logger = new Logger(ScanPermissionsScript.name);
  constructor() {}

  async run() {
    // 初始化 ts-morph 项目
    const project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
    });

    // 添加源文件
    project.addSourceFilesAtPaths('src/**/*.ts');

    const permissions: PermissionInfo[] = [];

    // 遍历所有源文件
    for (const sourceFile of project.getSourceFiles()) {
      // 查找所有类声明
      sourceFile.getClasses().forEach((classDeclaration) => {
        // 获取类名
        const className = classDeclaration.getName();
        const classDocs = classDeclaration.getJsDocs();
        // 获取类注释
        const classComment = classDocs.map((doc) => doc.getComment()).join('\n') || '-';
        // 获取 @group 标识信息
        const classGroupTag = classDocs.flatMap((doc) => doc.getTags()).find((tag) => tag.getTagName() === 'group');
        const classGroup = classGroupTag ? String(classGroupTag.getComment()) : '-';

        // 遍历类中的所有方法
        classDeclaration.getMethods().forEach((method) => {
          // 查找 @Permission 装饰器
          const permissionDecorator = method.getDecorator('UsePermission');
          if (permissionDecorator) {
            const args = permissionDecorator.getArguments();
            const channels = args.map((arg) => voca.trim(arg.getText(), `'"`).toUpperCase());
            const methodComment =
              method
                .getJsDocs()
                .map((doc) => doc.getComment())
                .join('\n') || '-';
            permissions.push({
              resource: className || 'Anonymous',
              resourceLabel: classComment,
              group: classGroup,
              action: method.getName(),
              actionLabel: methodComment,
              channels: channels as PermissionInfo['channels'],
            });
          }
        });
      });
    }

    // 创建输出目录
    const outputDir = path.join(process.cwd(), 'src', 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入权限信息到文件
    const outputPath = path.join(outputDir, 'permissions.ts');
    const fileContent = `export const Permissions = ${JSON.stringify(permissions, null, 2)};`;
    const formatted = await prettier.format(fileContent, {
      parser: 'typescript', // 指定解析器为 TypeScript
      singleQuote: true,
    });
    fs.writeFileSync(outputPath, formatted, 'utf-8');

    console.log(`权限信息已写入到: ${outputPath}`);
    console.log(`共扫描到 ${permissions.length} 个权限定义`);

    this.logger.log('Permissions scan complete');
  }
}
// This is the entry point of the application
async function bootstrap() {
  const logger = new Logger(ScanPermissionsScript.name);
  const script = new ScanPermissionsScript();
  script.run().then(() => {
    logger.log('Running in external script mode');
    process.exit(0);
  });
}

if (require.main === module) {
  bootstrap().then();
}
