import z from 'zod';

export const Languages = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
});

export const GetAllLanguages = z.object({
  data: z.array(Languages),
  total: z.number(),
});

export const CreateLanguageBody = z.object({
  name: z.string(),
});

export type CreateLanguageBodyTypes = z.infer<typeof CreateLanguageBody>;
export type GetAllLanguagesTypes = z.infer<typeof GetAllLanguages>;
export type LanguagesTypes = z.infer<typeof Languages>;
