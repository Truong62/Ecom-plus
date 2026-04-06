import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permission.repo';
import type {
  CreatePermissionBodyType,
  CreateRoleBodyType,
  PaginationQueryType,
  UpdatePermissionBodyType,
  UpdateRoleBodyType,
} from './permission.model';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  findAllPermissions(query: PaginationQueryType) {
    return this.permissionRepository.findAllPermissions(query);
  }

  findAllRoles(query: PaginationQueryType) {
    return this.permissionRepository.findAllRoles(query);
  }

  findPermissionById(id: number) {
    return this.permissionRepository.findPermissionById(id);
  }

  findRoleById(id: number) {
    return this.permissionRepository.findRoleById(id);
  }

  createPermission(data: CreatePermissionBodyType, createdById: number) {
    return this.permissionRepository.createPermission(data, createdById);
  }

  createRole(data: CreateRoleBodyType, createdById: number) {
    return this.permissionRepository.createRole(data, createdById);
  }

  updatePermission(id: number, data: UpdatePermissionBodyType, updatedById: number) {
    return this.permissionRepository.updatePermission(id, data, updatedById);
  }

  updateRole(id: number, data: UpdateRoleBodyType, updatedById: number) {
    return this.permissionRepository.updateRole(id, data, updatedById);
  }

  deletePermission(id: number, isHard: boolean, deletedById?: number) {
    return this.permissionRepository.deletePermission(id, isHard, deletedById);
  }

  deleteRole(id: number, isHard: boolean, deletedById?: number) {
    return this.permissionRepository.deleteRole(id, isHard, deletedById);
  }
}
