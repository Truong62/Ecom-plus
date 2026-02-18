import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { RegisterBodyType, User } from './auth.model';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<User, 'roleId'>) {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }
}
