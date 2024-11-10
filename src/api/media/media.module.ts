import { join } from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { MediaController } from './media.controller';
import { MediaResolver } from './media.resolver';
import { MediaService } from './media.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'data', 'media'),
      serveRoot: '/media', // 访问静态文件的前缀路径
    }),
  ],
  providers: [MediaResolver, MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
