import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/common/decorators';
import { NoPaginationItems } from 'src/common/dto';
import { JwtAuthGuard } from 'src/common/guards';
import { Auth } from 'src/generated/graphql';

import { PermissionChannelType, PermissionInfo } from './entities';
import { PermissionService } from './permission.service';

const PermissionInfoItems = NoPaginationItems(PermissionInfo);

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
  @Query(() => PermissionInfoItems)
  findAllPermission(@Args('channel', { type: () => PermissionChannelType }) channel: PermissionChannelType) {
    const items = this.service.findAll(channel);
    return { items, totalCount: items.length };
  }

  /**
   * 新增权限绑定
   * @param channel
   * @param targetId
   * @param subject
   * @param action
   * @param auth
   */
  @UsePermission('ADMIN')
  @Mutation(() => PermissionInfo)
  addPermissionBind(
    @Args('channel', { type: () => PermissionChannelType }) channel: PermissionChannelType,
    @Args('targetId') targetId: string,
    @Args('subject') subject: string,
    @Args('action') action: string,
    @CurrentAuth() auth: Auth,
  ) {
    this.service.setAuth(auth);
    return this.service.addPermissionBind(channel, targetId, subject, action);
  }

  /**
   * 移除权限绑定
   * @param channel
   * @param targetId
   * @param subject
   * @param action
   * @param auth
   */
  @UsePermission('ADMIN')
  @Mutation(() => PermissionInfo)
  removePermissionBind(
    @Args('channel', { type: () => PermissionChannelType }) channel: PermissionChannelType,
    @Args('targetId') targetId: string,
    @Args('subject') subject: string,
    @Args('action') action: string,
    @CurrentAuth() auth: Auth,
  ) {
    this.service.setAuth(auth);
    return this.service.removePermissionBind(channel, targetId, subject, action);
  }
}
