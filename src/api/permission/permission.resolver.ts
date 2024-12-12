import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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

  /**
   * 新增权限绑定
   * @param channel
   * @param targetId
   * @param resource
   * @param action
   */
  @UsePermission('ADMIN')
  @Mutation(() => PermissionInfo)
  addPermissionBind(
    @Args('channel', { type: () => PermissionChannelType }) channel: PermissionChannelType,
    @Args('targetId') targetId: string,
    @Args('resource') resource: string,
    @Args('action') action: string,
  ) {
    return this.service.addPermissionBind(channel, targetId, resource, action);
  }
}
