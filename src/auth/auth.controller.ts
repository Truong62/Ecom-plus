import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LogoutBodyDTO,
  MessageResDTO,
  RefreshTokenBodyDTO,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOTPBodyDTO,
  TwoFactorSetupResponseDTO,
} from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { isPublish } from 'src/shared/decorators/auth.decorator';
import { GoogleService } from './google.service';
import envConfig from '../shared/config';
import type { Response } from 'express';
import { ActiveUser } from '../shared/decorators/active-user.decorator';
import { TwoFactorSetupResponseType } from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @isPublish()
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body);
  }

  @Post('otp')
  @isPublish()
  @ZodSerializerDto(MessageResDTO)
  sendOtp(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOtp(body);
  }

  @Post('login')
  @isPublish()
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    });
  }

  @Post('refresh-token')
  @isPublish()
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip });
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken);
  }

  @Get('google-link')
  @isPublish()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getGoogleAuthLink(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({
      userAgent,
      ip,
    });
  }

  @Get('google/callback')
  @isPublish()
  async googleCallBack(@Query() query: { code: string; state: string }, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({ code: query.code, state: query.state });
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      );
    } catch (e) {
      console.error(e);
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${e}`);
    }
  }

  @Post('forgot-password')
  @isPublish()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body);
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResponseDTO)
  setupTwoFA(@ActiveUser('userId') userId: number): Promise<TwoFactorSetupResponseType> {
    return this.authService.setupTwoFactorAuth(userId);
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDTO)
  disableTwoFA(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.disableTwoFA({ ...body, userId });
  }
}
