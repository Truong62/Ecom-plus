import z from 'zod';
import { UserStatus } from '../constants/auth.constants';

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phoneNumber: z.string().min(9).max(16),
  avatar: z.string().nullable(),
  status: z.enum(UserStatus),
  totpSecret: z.string().nullable(),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  password: z.string().min(6).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
