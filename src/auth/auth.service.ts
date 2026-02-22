import { HashingService } from './../shared/hashing.service';
import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { RolesService } from './roles.service';
import { TokenService } from 'src/shared/token.service';
import { RefreshTokenBodyDTO } from './auth.dto';
import { RegisterBodyType, SendOTPBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repository/shared-user.repo';
import { genCodeOTP } from 'src/shared/helpers';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants';
import { EmailService } from 'src/shared/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authRepository: AuthRepository,
    private readonly roleService: RolesService,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) {}
  async register(body: RegisterBodyType) {
    const verifyCode = await this.authRepository.findVerificationCode({
      email: body.email,
      code: body.code,
      type: TypeOfVerificationCode.REGISTER,
    });

    if (!verifyCode) {
      throw new UnprocessableEntityException([
        {
          message: 'Invalid or expired verification code',
          path: 'code',
        },
      ]);
    }

    if (verifyCode.expiresAt < new Date()) {
      throw new UnprocessableEntityException([
        {
          message: 'Verification code has expired',
          path: 'code',
        },
      ]);
    }

    const clientRoleId = await this.roleService.getClientRoleId();
    const hashedPassword = await this.hashingService.hashPassword(body.password);
    const { confirmPassword: _, code: __, ...registerData } = body;

    try {
      return await this.authRepository.createUser({
        ...registerData,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (e) {
      console.log(e);
      if (e.meta?.target?.includes('email')) {
        throw new ConflictException('Email already exists');
      }

      throw e;
    }
  }

  async sendOtp(body: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({ email: body.email });

    if (user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email already exists',
          path: 'email',
        },
      ]);
    }

    const code = genCodeOTP();
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)), // expires in 5 minutes
    });

    // @todo: add domain send to emails
    const { error } = await this.emailService.sendOTP({ code, email: body.email });

    if (error) {
      throw new UnprocessableEntityException([
        {
          message: 'Failed to send OTP, please try again later',
          path: 'code',
        },
      ]);
    }

    return verificationCode;
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
