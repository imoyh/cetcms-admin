import { Args, Query, Resolver } from '@nestjs/graphql';

import { ActionUsageStatistics } from './entities';
import { AnalyticsService } from './services';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly service: AnalyticsService) {}

  @Query(() => [ActionUsageStatistics])
  findActionUsageStatistics(
    @Args('fromDate', { type: () => Date }) fromDate: Date,
    @Args('toDate', { type: () => Date }) toDate: Date,
  ) {
    return this.service.findActionUsageStatistics(fromDate, toDate);
  }
}
