import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export class RegisterResponseDto extends createZodDto(
  z
    .object({
      id: z.number(),
      email: z.string(),
      name: z.string(),
      phoneNumber: z.string(),
      avatar: z.string(),
      status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
      roleId: z.string(),
      createById: z.number().nullable(),
      updataById: z.number().nullable(),
      deletedAt: z.date(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
    .strict(),
) {}

export class RegisterBodyDto extends createZodDto(
  z
    .object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      password: z.string().min(6).max(100),
      phoneNumber: z.string().min(10).max(15),
      confirmPassword: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'confirmPassword does not match password',
          path: ['confirmPassword'],
        });
      }
    }),
) {}

export class RefreshTokenBodyDTO extends createZodDto(
  z
    .object({
      refreshToken: z.string(),
    })
    .strict(),
) {}
