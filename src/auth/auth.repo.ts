import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { DeviceType, RegisterBodyType, RoleType, TypeOfVerificationCode, VerificationCodeType } from './auth.model';
import { User } from 'src/shared/models/shared-user.model';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<User, 'roleId'>,
  ): Promise<Omit<User, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createVerificationCode(
    data: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: { email_type: { email: data.email, type: data.type } },
      create: data,
      update: {
        code: data.code,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findVerificationCode(
    where:
      | {
          email: string;
          code: string;
          type: TypeOfVerificationCode;
        }
      | { email: string }
      | { id: number },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findFirst({
      where,
    });
  }

  async createRefreshToken(data: { token: string; deviceId: number; userId: number; expiresAt: Date }) {
    return await this.prismaService.refreshToken.create({
      data,
    });
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & { lastActive?: Date; isActive?: boolean },
  ): Promise<DeviceType> {
    return await this.prismaService.device.create({
      data,
    });
  }

  async findUniqueUserIncludeRole(
    whereObj: { id: number } | { email: string },
  ): Promise<(User & { role: RoleType }) | null> {
    return await this.prismaService.user.findUnique({
      where: whereObj,
      include: {
        role: true,
      },
    });
  }
}
