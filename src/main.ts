import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

// This is the entry point of the application
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const service = app.get(AppService);
  await service.start(app);
  return app;
}
bootstrap().then();
