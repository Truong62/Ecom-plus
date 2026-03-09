import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

export const VerificationCode = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string(),
  type: z.enum(TypeOfVerificationCode),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: VerificationCode.shape.code,
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
  });

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type VerificationCodeType = z.infer<typeof VerificationCode>;

export const SendOTPBodySchema = VerificationCode.pick({
  email: true,
  type: true,
});

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
export type TypeOfVerificationCode = (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode];

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();
export type LoginBodyType = z.infer<typeof LoginBodySchema>;

export const LoginResSchema = z.object({
  refreshToken: z.string(),
  accessToken: z.string(),
});
export type LoginResType = z.infer<typeof LoginResSchema>;

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export const RefreshTokenResponseSchema = LoginResSchema;
export type RefreshTokenResponseType = z.infer<typeof RefreshTokenResponseSchema>;

export const RefreshTokenModelSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
});
export type RefreshTokenModelType = z.infer<typeof RefreshTokenModelSchema>;

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string().min(1).max(500),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export type DeviceType = z.infer<typeof DeviceSchema>;

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RoleType = z.infer<typeof RoleSchema>;
