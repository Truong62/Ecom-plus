import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '../models/shared-user.model';

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(whereObj: { id: number } | { email: string }): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: whereObj,
    });
  }
}
