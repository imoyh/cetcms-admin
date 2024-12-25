import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class PermissionInfo {
  @Field(() => String)
  subject: string;

  @Field(() => String)
  subjectLabel: string;

  @Field(() => String)
  group: string;

  @Field(() => String)
  action: string;

  @Field(() => String)
  actionLabel: string;

  @Field(() => [PermissionChannelType])
  channels: Array<keyof typeof PermissionChannelType>;
}

export enum PermissionChannelType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

registerEnumType(PermissionChannelType, { name: 'PermissionChannelType', description: undefined });
