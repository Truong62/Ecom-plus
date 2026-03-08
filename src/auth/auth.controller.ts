import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDTO, RefreshTokenBodyDTO, RegisterBodyDto, RegisterResponseDto, SendOTPBodyDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { IP } from 'src/shared/decorators/ip.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body);
  }

  @Post('otp')
  sendOtp(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOtp(body);
  }

  @Post('login')
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @IP() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return this.authService.refreshToken(body);
  }

  @Post('logout')
  async logout(@Body() body: RefreshTokenBodyDTO) {
    return this.authService.logout(body);
  }
}
