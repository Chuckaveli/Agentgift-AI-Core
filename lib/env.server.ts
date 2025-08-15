import { z } from "zod"
import { env as clientEnv } from "./env.client"

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  MAKE_WEBHOOK_URL: z.string().url().optional(),
  PORT: z.string().optional(),
  ORCHESTRATOR_SIGNING_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  WHISPER_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_AVELYN_ID: z.string().optional(),
  ELEVENLABS_VOICE_GALEN_ID: z.string().optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
})

export const env = { ...clientEnv, ...serverSchema.parse(process.env) }
