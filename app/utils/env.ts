import { z } from "zod";

import { isBrowser } from "./is-browser";

export const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().min(1).url(),
  SUPABASE_SERVICE_ROLE: z.string().min(1),
  SUPABASE_ANON_PUBLIC: z.string().min(1),
  SERVER_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]),
  TZ: z.literal("UTC"),
});

type Env = z.infer<typeof EnvSchema>;

const PublicEnvSchema = EnvSchema.pick({
  SUPABASE_URL: true,
  SUPABASE_ANON_PUBLIC: true,
  SERVER_URL: true,
  NODE_ENV: true,
});

type PublicEnv = z.infer<typeof PublicEnvSchema>;

// Because we don't want to use `process.env` or `window.env` everywhere
// We need to cast here to enable intellisense on all the env variables
// We are safe because this is not the same env depending on the platform (browser or server)
export const env = (
  isBrowser ? PublicEnvSchema.parse(window.env) : EnvSchema.parse(process.env)
) as Env;

export function initEnv() {
  return env;
}

/**
 * Use that in root loader
 *
 * @returns public envs
 */
export function getBrowserEnv() {
  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_PUBLIC: env.SUPABASE_ANON_PUBLIC,
    SERVER_URL: env.SERVER_URL,
    NODE_ENV: env.NODE_ENV,
  } satisfies PublicEnv;
}

declare global {
  interface Window {
    env: PublicEnv;
  }
}
