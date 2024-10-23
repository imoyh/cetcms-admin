import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { CreateAdminInput } from './dto/create-admin.input';
import { UpdateAdminInput } from './dto/update-admin.input';

@Resolver('Admin')
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Mutation('createAdmin')
  create(@Args('createAdminInput') createAdminInput: CreateAdminInput) {
    return this.adminService.create(createAdminInput);
  }

  @Query('admin')
  findAll() {
    return this.adminService.findAll();
  }

  @Query('admin')
  findOne(@Args('id') id: number) {
    return this.adminService.findOne(id);
  }

  @Mutation('updateAdmin')
  update(@Args('updateAdminInput') updateAdminInput: UpdateAdminInput) {
    return this.adminService.update(updateAdminInput.id, updateAdminInput);
  }

  @Mutation('removeAdmin')
  remove(@Args('id') id: number) {
    return this.adminService.remove(id);
  }
}
