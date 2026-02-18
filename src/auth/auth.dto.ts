import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { RegisterBodySchema, RegisterResponseSchema, SendOTPBodySchema } from './auth.model';

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
