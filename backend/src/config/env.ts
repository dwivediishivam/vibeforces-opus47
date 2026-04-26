import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  OPENAI_API_KEY: parsed.OPENAI_API_KEY ?? parsed.OPENAI_KEY ?? "",
  ANTHROPIC_API_KEY: parsed.ANTHROPIC_API_KEY ?? "",
};

export const isProduction = env.NODE_ENV === "production";
