import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().default('algolab'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  
  // Auth
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  
  db: {
    host: parsed.data.DB_HOST,
    port: parseInt(parsed.data.DB_PORT, 10),
    database: parsed.data.DB_NAME,
    user: parsed.data.DB_USER,
    password: parsed.data.DB_PASSWORD,
  },
  
  jwt: {
    secret: parsed.data.JWT_SECRET,
    accessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },
  
  cors: {
    origin: parsed.data.CORS_ORIGIN,
  },
} as const;
