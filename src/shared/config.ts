import fs from 'fs';
import path from 'path';
import z from 'zod';
import { config } from 'dotenv';

config({
  path: '.env',
});

if (!fs.existsSync(path.resolve('.env'))) {
  process.exit(1);
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PHONENUMBER: z.string(),

  OTP_EXPIRES_IN: z.string(),
});

const configService = configSchema.safeParse(process.env);

if (!configService.success) {
  console.log(configService.error);
  process.exit(1);
}

const envConfig = configService.data;
export default envConfig;
