import z from 'zod';

export const HTTPMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']);

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  path: z.string().max(1000),
  method: HTTPMethodSchema,
  module: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Pagination
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Permission schemas
export const GetAllPermissionsSchema = z.object({
  data: z.array(PermissionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetPermissionDetailSchema = PermissionSchema.extend({
  roles: z.array(RoleSchema.pick({ id: true, name: true })),
});

export const CreatePermissionBodySchema = z
  .object({
    name: z.string().max(500),
    description: z.string().optional(),
    path: z.string().max(1000),
    method: HTTPMethodSchema,
    module: z.string().max(500).optional(),
  })
  .strict();

export const UpdatePermissionBodySchema = z
  .object({
    name: z.string().max(500).optional(),
    description: z.string().optional(),
    path: z.string().max(1000).optional(),
    method: HTTPMethodSchema.optional(),
    module: z.string().max(500).optional(),
  })
  .strict();

// Role schemas
export const GetAllRolesSchema = z.object({
  data: z.array(RoleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetRoleDetailSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema.pick({ id: true, name: true, path: true, method: true, module: true })),
});

export const CreateRoleBodySchema = z
  .object({
    name: z.string().max(500),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    permissionIds: z.array(z.number()).optional(),
  })
  .strict();

export const UpdateRoleBodySchema = z
  .object({
    name: z.string().max(500).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    permissionIds: z.array(z.number()).optional(),
  })
  .strict();

// Types
export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
export type HTTPMethodType = z.infer<typeof HTTPMethodSchema>;
export type PermissionType = z.infer<typeof PermissionSchema>;
export type RoleType = z.infer<typeof RoleSchema>;
export type GetAllPermissionsType = z.infer<typeof GetAllPermissionsSchema>;
export type GetPermissionDetailType = z.infer<typeof GetPermissionDetailSchema>;
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
export type GetAllRolesType = z.infer<typeof GetAllRolesSchema>;
export type GetRoleDetailType = z.infer<typeof GetRoleDetailSchema>;
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;
