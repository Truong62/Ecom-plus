import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  DisableTwoFactorBodySchema,
  ForgotPasswordBodySchema,
  LoginBodySchema,
  LoginResSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOTPBodySchema,
  TwoFactorSetupResponseSchema,
} from './auth.model';

export class RefreshTokenBodyDTO extends createZodDto(
  z
    .object({
      refreshToken: z.string(),
    })
    .strict(),
) {}

export class LogoutBodyDTO extends createZodDto(
  z
    .object({
      refreshToken: z.string(),
    })
    .strict(),
) {}

export class MessageResDTO extends createZodDto(
  z.object({
    message: z.string(),
  }),
) {}

export class GetAuthorizationUrlResDTO extends createZodDto(
  z.object({
    url: z.string(),
  }),
) {}
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class LoginResponseDTO extends createZodDto(LoginResSchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}
export class TwoFactorSetupResponseDTO extends createZodDto(TwoFactorSetupResponseSchema) {}
export class DisableTwoFactorBodyDTO extends createZodDto(DisableTwoFactorBodySchema) {}
