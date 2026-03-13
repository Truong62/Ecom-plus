import { HashingService } from '../shared/hashing.service';
import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { RolesService } from './roles.service';
import { TokenService } from 'src/shared/token.service';
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenType,
  RegisterBodyType,
  SendOTPBodyType,
  TwoFactorSetupResponseType,
} from './auth.model';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repository/shared-user.repo';
import { genCodeOTP } from 'src/shared/helpers';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants';
import { EmailService } from 'src/shared/email.service';
import { TokenPayload } from 'src/types/auth';
import { TOTPAlreadyEnabledException } from './error.model';
import { TwoFactorAuthService } from '../shared/TwoFa.service';

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
    private readonly twoFactorAuthService: TwoFactorAuthService,
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
      const [user] = await Promise.all([
        this.authRepository.createUser({
          ...registerData,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.REGISTER,
        }),
      ]);
      return user;
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

    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email already exists',
          path: 'email',
        },
      ]);
    }

    if (body.type === TypeOfVerificationCode.REGISTER && !user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email not found',
          path: 'email',
        },
      ]);
    }

    const code = genCodeOTP();
    await this.authRepository.createVerificationCode({
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

    return { message: 'OTP sent successfully' };
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    });

    if (!user)
      throw new UnprocessableEntityException([
        {
          message: 'User not found',
          path: 'email',
        },
      ]);

    const isPasswordValid = await this.hashingService.comparePassword(body.password, user.password);

    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        filed: 'password',
        error: 'password is incorrect',
      });
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    });

    return this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });
  }

  async generateTokens(payload: TokenPayload) {
    const accessToken = this.tokenService.signAccessToken({
      userId: payload.userId,
      deviceId: payload.deviceId,
      roleId: payload.roleId,
      roleName: payload.roleName,
    });
    const refreshToken = this.tokenService.signRefreshToken({
      userId: payload.userId,
    });

    const decodeRefToken = await this.tokenService.verifyRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      deviceId: payload.deviceId,
      userId: payload.userId,
      expiresAt: new Date(decodeRefToken.exp * 1000),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenType & { userAgent: string; ip: string }) {
    try {
      const token = await this.tokenService.verifyRefreshToken(refreshToken);

      const existingToken = await this.authRepository.findUniqueUserIncludeUserRole({
        token: refreshToken,
      });

      if (!existingToken) {
        throw new UnauthorizedException({
          field: 'refreshToken',
          error: 'Refresh token not found or already expired',
        });
      }

      const $updateDevice = this.authRepository.createDevice({
        userId: token.userId,
        userAgent,
        ip,
      });

      const $deleteOldToken = this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      });

      const $token = this.generateTokens({
        userId: token.userId,
        deviceId: existingToken.deviceId,
        roleId: existingToken.user.roleId,
        roleName: existingToken.user.role.name,
      });

      const results = await Promise.all([$token, $updateDevice, $deleteOldToken]);
      return results[0];
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException({
        filed: 'refreshToken',
        error: error.message,
      });
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken);

      const tokenData = await this.authRepository.findUniqueUserIncludeUserRole({
        token: refreshToken,
      });

      if (!tokenData) {
        throw new UnauthorizedException({
          field: 'refreshToken',
          error: 'Refresh token not found',
        });
      }

      await Promise.all([
        this.authRepository.deleteRefreshToken({
          token: refreshToken,
        }),
        this.authRepository.updateDevice(tokenData.deviceId, {
          isActive: false,
        }),
      ]);

      return { message: 'Logout successful' };
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException({
        filed: 'refreshToken',
        error: error.message,
      });
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, newPassword, code } = body;

    const user = await this.sharedUserRepository.findUnique({ email });

    if (!user)
      throw new UnprocessableEntityException({
        field: 'email',
        error: 'User not found',
      });

    const verifyCode = await this.authRepository.findVerificationCode({
      email: body.email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
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

    const hashedPassword = await this.hashingService.hashPassword(newPassword);
    await Promise.all([
      this.authRepository.updateUser(
        { id: user.id },
        {
          password: hashedPassword,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.FORGOT_PASSWORD,
      }),
    ]);

    return {
      message: 'Forgot password successfully',
    };
  }

  async setupTwoFactorAuth(userId: number): Promise<TwoFactorSetupResponseType> {
    const user = await this.sharedUserRepository.findUnique({ id: userId });

    if (!user) {
      throw new UnprocessableEntityException({
        field: 'userId',
        error: 'User not found',
      });
    }

    if (user.totpSecret) throw TOTPAlreadyEnabledException;

    const { uri, secret } = this.twoFactorAuthService.generateTOTP(user.email);
    await this.authRepository.updateUser(
      {
        id: userId,
      },
      { totpSecret: secret },
    );

    return {
      uri,
      secret,
    };
  }

  async logoutAll(userId: number) {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
