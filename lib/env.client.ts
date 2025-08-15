import { z } from "zod"

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_ELEVENLABS_VOICE_AVELYN_ID: z.string().optional(),
  NEXT_PUBLIC_ELEVENLABS_VOICE_GALEN_ID: z.string().optional(),
})

export const env = clientSchema.parse(process.env)
