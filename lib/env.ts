import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  MAKE_WEBHOOK_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  PORT: z.string().optional(),
  // Server-side only environment variables
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_AVELYN_ID: z.string().optional(),
  ELEVENLABS_VOICE_GALEN_ID: z.string().optional(),
  // Public (non-sensitive) voice IDs
  NEXT_PUBLIC_ELEVENLABS_VOICE_AVELYN_ID: z.string().optional(),
  NEXT_PUBLIC_ELEVENLABS_VOICE_GALEN_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)
