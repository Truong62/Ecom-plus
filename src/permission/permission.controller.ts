import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { PermissionService } from './permission.service';
import {
  CreatePermissionBodyDTO,
  CreateRoleBodyDTO,
  GetAllPermissionsDTO,
  GetAllRolesDTO,
  GetPermissionDetailDTO,
  GetRoleDetailDTO,
  PaginationQueryDTO,
  PermissionDTO,
  RoleDTO,
  UpdatePermissionBodyDTO,
  UpdateRoleBodyDTO,
} from './permission.dto';
import type {
  GetAllPermissionsType,
  GetAllRolesType,
  GetPermissionDetailType,
  GetRoleDetailType,
  PermissionType,
  RoleType,
} from './permission.model';
import { ActiveUser } from '../shared/decorators/active-user.decorator';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(GetAllPermissionsDTO)
  findAllPermissions(@Query() query: PaginationQueryDTO): Promise<GetAllPermissionsType> {
    return this.permissionService.findAllPermissions(query);
  }

  @Get(':id')
  @ZodSerializerDto(GetPermissionDetailDTO)
  findPermissionById(@Param('id', ParseIntPipe) id: number): Promise<GetPermissionDetailType> {
    return this.permissionService.findPermissionById(id);
  }

  @Post()
  @ZodSerializerDto(PermissionDTO)
  createPermission(
    @Body() body: CreatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<PermissionType> {
    return this.permissionService.createPermission(body, userId);
  }

  @Get('roles')
  @ZodSerializerDto(GetAllRolesDTO)
  findAllRoles(@Query() query: PaginationQueryDTO): Promise<GetAllRolesType> {
    return this.permissionService.findAllRoles(query);
  }

  @Put(':id')
  @ZodSerializerDto(PermissionDTO)
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<PermissionType> {
    return this.permissionService.updatePermission(id, body, userId);
  }

  @Get('roles/:id')
  @ZodSerializerDto(GetRoleDetailDTO)
  findRoleById(@Param('id', ParseIntPipe) id: number): Promise<GetRoleDetailType> {
    return this.permissionService.findRoleById(id);
  }

  @Post('roles')
  @ZodSerializerDto(GetRoleDetailDTO)
  createRole(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number): Promise<GetRoleDetailType> {
    return this.permissionService.createRole(body, userId);
  }

  @Delete(':id')
  @ZodSerializerDto(PermissionDTO)
  deletePermission(
    @Param('id', ParseIntPipe) id: number,
    @Query('isHard') isHard?: string,
    @ActiveUser('userId') userId?: number,
  ): Promise<PermissionType> {
    return this.permissionService.deletePermission(id, isHard === 'true', userId);
  }

  @Put('roles/:id')
  @ZodSerializerDto(GetRoleDetailDTO)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<GetRoleDetailType> {
    return this.permissionService.updateRole(id, body, userId);
  }

  @Delete('roles/:id')
  @ZodSerializerDto(RoleDTO)
  deleteRole(
    @Param('id', ParseIntPipe) id: number,
    @Query('isHard') isHard?: string,
    @ActiveUser('userId') userId?: number,
  ): Promise<RoleType> {
    return this.permissionService.deleteRole(id, isHard === 'true', userId);
  }
}
