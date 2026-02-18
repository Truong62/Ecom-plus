import { HashingService } from './../shared/hashing.service';
import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { RolesService } from './roles.service';
import { TokenService } from 'src/shared/token.service';
import { RefreshTokenBodyDTO } from './auth.dto';
import { RegisterBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authRepository: AuthRepository,
    private readonly roleService: RolesService,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
  ) {}
  async register(body: RegisterBodyType) {
    const clientRoleId = await this.roleService.getClientRoleId();
    const hashedPassword = await this.hashingService.hashPassword(body.password);
    const { confirmPassword: _, ...registerData } = body;

    try {
      return await this.authRepository.createUser({
        ...registerData,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (e) {
      if (e.meta?.target?.includes('email')) {
        throw new ConflictException('Email already exists');
      }

      throw e;
    }
  }

  async login(body: any) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { email: body.email },
    });

    if (!user) throw new Error('user not found');

    const isPasswordValid = await this.hashingService.comparePassword(user.password, body.password);

    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        filed: 'password',
        error: 'password is incorrect',
      });
    }

    await this.prismaService.refreshToken.delete({
      where: {
        token: body.refreshToken,
      },
    });

    return this.generateTokens({ userId: user.id });
  }

  async generateTokens(payload: { userId: number }) {
    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    const decodeRefToken = await this.tokenService.verifyRefreshToken(refreshToken);

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        deviceId: 89889,
        userId: payload.userId,
        expiresAt: new Date(decodeRefToken.exp * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(body: RefreshTokenBodyDTO) {
    try {
      const token = await this.tokenService.verifyRefreshToken(body.refreshToken);

      const existingToken = await this.prismaService.refreshToken.findUnique({
        where: {
          token: body.refreshToken,
        },
      });

      if (!existingToken) {
        throw new UnprocessableEntityException({
          field: 'refreshToken',
          error: 'Refresh token not found or already expired',
        });
      }

      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      });

      return this.generateTokens({ userId: token.userId });
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException({
        filed: 'refreshToken',
        error: error.message,
      });
    }
  }

  async logout(body: RefreshTokenBodyDTO) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, existingToken] = await Promise.all([
        this.tokenService.verifyRefreshToken(body.refreshToken),
        this.prismaService.refreshToken.findUnique({
          where: {
            token: body.refreshToken,
          },
        }),
      ]);

      if (!existingToken) {
        throw new UnprocessableEntityException({
          field: 'refreshToken',
          error: 'Refresh token not found or already expired',
        });
      }

      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      });

      return { message: 'Logout successful' };
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException({
        filed: 'refreshToken',
        error: error.message,
      });
    }
  }

  async logoutAll(userId: number) {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
