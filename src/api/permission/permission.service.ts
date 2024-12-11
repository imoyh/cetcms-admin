import { Injectable } from '@nestjs/common';
import { PermissionChannelType } from 'src/api/permission/entities';
import { Permissions } from 'src/generated/permissions';

@Injectable()
export class PermissionService {
  async findAll(channel: PermissionChannelType) {
    return Permissions.filter((p) => p.channels.includes(channel));
  }
}
