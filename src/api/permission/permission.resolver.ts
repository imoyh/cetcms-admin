import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePermission } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';

import { PermissionChannelType, PermissionInfo } from './entities';
import { PermissionService } from './permission.service';

/**
 * 权限管理操作
 * @group Admin
 */
@UseGuards(JwtAuthGuard)
@Resolver()
export class PermissionResolver {
  constructor(private readonly service: PermissionService) {}

  /**
   * 查询所有权限信息
   * @param channel
   */
  @UsePermission('ADMIN')
  @Query(() => [PermissionInfo])
  findAllPermission(@Args('channel', { type: () => PermissionChannelType }) channel: PermissionChannelType) {
    return this.service.findAll(channel);
  }
}
