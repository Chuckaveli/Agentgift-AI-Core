// Environment variable validation and types
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // External APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  WHISPER_API_KEY: process.env.WHISPER_API_KEY!,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY!,

  // ElevenLabs Voice IDs (server-side only)
  ELEVENLABS_VOICE_AVELYN_ID: process.env.ELEVENLABS_VOICE_AVELYN_ID!,
  ELEVENLABS_VOICE_GALEN_ID: process.env.ELEVENLABS_VOICE_GALEN_ID!,

  // Webhooks and integrations
  MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,

  // Site configuration
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  PORT: process.env.PORT || "3000",

  // AI integrations
  DEEPINFRA_API_KEY: process.env.DEEPINFRA_API_KEY!,
  FAL_KEY: process.env.FAL_KEY!,

  // Orchestrator
  ORCHESTRATOR_SIGNING_SECRET: process.env.ORCHESTRATOR_SIGNING_SECRET!,

  // BFF URL
  NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:3000",
}

// Validation function
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_BFF_URL",
  ]

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

// Client-safe environment variables
export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:3000",
}
