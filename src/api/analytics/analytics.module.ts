import { Module } from '@nestjs/common';

import { AnalyticsResolver } from './analytics.resolver';
import * as Services from './services';

@Module({
  providers: [AnalyticsResolver, ...Object.values(Services)],
  exports: [...Object.values(Services)],
})
export class AnalyticsModule {}
