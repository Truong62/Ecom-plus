import { ROLE_NAME } from 'src/shared/constants/role.constants';
import { PrismaService } from './../shared/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesService {
  private roleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.roleId) return this.roleId;

    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: ROLE_NAME.CLIENT,
      },
    });

    this.roleId = role.id;
    return this.roleId;
  }
}
