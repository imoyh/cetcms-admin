import { join } from 'path';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { MediaAuthMiddleware } from './middlewares';
import * as Resolvers from './resolvers';
import * as Services from './services';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'data', 'media'),
      serveRoot: '/media', // 访问静态文件的前缀路径
    }),
  ],
  providers: [...Object.values(Resolvers), ...Object.values(Services)],
})
export class MediaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MediaAuthMiddleware).forRoutes('/media*'); // 应用中间件到 '/media' 路径的请求
  }
}
