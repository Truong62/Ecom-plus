import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  LoginBodySchema,
  LoginResSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOTPBodySchema,
} from './auth.model';

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RefreshTokenBodyDTO extends createZodDto(
  z
    .object({
      refreshToken: z.string(),
    })
    .strict(),
) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class LoginResponseDTO extends createZodDto(LoginResSchema) {}

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
