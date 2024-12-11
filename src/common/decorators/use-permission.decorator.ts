import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PermissionChannelType } from 'src/api/permission/entities';
import { PermissionGuard } from 'src/common/guards';

export type UsePermissionChannel = keyof typeof PermissionChannelType;
export const USE_PERMISSION_KEY = 'usePermission';
export const UsePermission = (...channels: UsePermissionChannel[]) => {
  return applyDecorators(SetMetadata(USE_PERMISSION_KEY, channels), UseGuards(PermissionGuard));
};
