import { createZodDto } from 'nestjs-zod';
import {
  CreatePermissionBodySchema,
  CreateRoleBodySchema,
  GetAllPermissionsSchema,
  GetAllRolesSchema,
  GetPermissionDetailSchema,
  GetRoleDetailSchema,
  PaginationQuerySchema,
  PermissionSchema,
  RoleSchema,
  UpdatePermissionBodySchema,
  UpdateRoleBodySchema,
} from './permission.model';

// Pagination
export class PaginationQueryDTO extends createZodDto(PaginationQuerySchema) {}

// Permission DTOs
export class GetAllPermissionsDTO extends createZodDto(GetAllPermissionsSchema) {}
export class GetPermissionDetailDTO extends createZodDto(GetPermissionDetailSchema) {}
export class PermissionDTO extends createZodDto(PermissionSchema) {}
export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

// Role DTOs
export class GetAllRolesDTO extends createZodDto(GetAllRolesSchema) {}
export class GetRoleDetailDTO extends createZodDto(GetRoleDetailSchema) {}
export class RoleDTO extends createZodDto(RoleSchema) {}
export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}
export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}
