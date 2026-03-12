import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LogoutBodyDTO,
  MessageResDTO,
  RefreshTokenBodyDTO,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOTPBodyDTO,
} from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { isPublish } from 'src/shared/decorators/auth.decorator';
import { GoogleService } from './google.service';
import envConfig from '../shared/config';
import type { Response } from 'express';

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
}
