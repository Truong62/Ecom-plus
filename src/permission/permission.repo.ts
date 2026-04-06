import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import type {
  CreatePermissionBodyType,
  CreateRoleBodyType,
  PaginationQueryType,
  UpdatePermissionBodyType,
  UpdateRoleBodyType,
} from './permission.model';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllPermissions({ page, limit }: PaginationQueryType) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prismaService.permission.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.permission.count({
        where: { deletedAt: null },
      }),
    ]);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findPermissionById(id: number) {
    return this.prismaService.permission.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: { roles: true },
    });
  }

  findRoleById(id: number) {
    return this.prismaService.role.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: { permissions: true },
    });
  }

  createPermission(data: CreatePermissionBodyType, createdById: number) {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  createRole(data: CreateRoleBodyType, createdById: number) {
    const { permissionIds, ...roleData } = data;
    return this.prismaService.role.create({
      data: {
        ...roleData,
        createdById,
        permissions: permissionIds ? { connect: permissionIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        permissions: true,
      },
    });
  }

  updatePermission(id: number, data: UpdatePermissionBodyType, updatedById: number) {
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  updateRole(id: number, data: UpdateRoleBodyType, updatedById: number) {
    const { permissionIds, ...roleData } = data;
    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: {
        ...roleData,
        updatedById,
        permissions: permissionIds ? { set: permissionIds.map((permId) => ({ id: permId })) } : undefined,
      },
      include: {
        permissions: true,
      },
    });
  }

  deletePermission(id: number, isHard: boolean, deletedById?: number) {
    if (isHard) {
      return this.prismaService.permission.delete({ where: { id } });
    }
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    });
  }

  deleteRole(id: number, isHard: boolean, deletedById?: number) {
    if (isHard) {
      return this.prismaService.role.delete({ where: { id } });
    }
    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    });
  }

  async findAllRoles({ page, limit }: PaginationQueryType) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prismaService.role.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.role.count({
        where: { deletedAt: null },
      }),
    ]);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
