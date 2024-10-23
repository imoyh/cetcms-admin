import { Global, Module } from '@nestjs/common';
import * as Features from './features';

@Global()
@Module({
  providers: [...Object.values(Features)],
  exports: [...Object.values(Features)],
})
export class UtilsModule {}
