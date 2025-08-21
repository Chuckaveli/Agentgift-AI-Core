// Environment variables with proper validation and fallbacks
export const env = {
  // Required Supabase variables - these must be set in production
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Site configuration
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000",
  NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000",
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || "",
  NEXT_PUBLIC_MAKE_WEBHOOK_URL: process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || "",
  PORT: process.env.PORT || "3000",

  // Server-only API keys
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  ELEVENLABS_VOICE_AVELYN_ID: process.env.ELEVENLABS_VOICE_AVELYN_ID || "",
  ELEVENLABS_VOICE_GALEN_ID: process.env.ELEVENLABS_VOICE_GALEN_ID || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_API_KEY_PREMIUM: process.env.OPENAI_API_KEY_PREMIUM || "",
  OPENAI_API_KEY_PRO: process.env.OPENAI_API_KEY_PRO || "",
  OPENAI_API_KEY_ENTERPRISE: process.env.OPENAI_API_KEY_ENTERPRISE || "",
  WHISPER_API_KEY: process.env.WHISPER_API_KEY || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  DEEPINFRA_API_KEY: process.env.DEEPINFRA_API_KEY || "",
  FAL_KEY: process.env.FAL_KEY || "",
  ORCHESTRATOR_SIGNING_SECRET: process.env.ORCHESTRATOR_SIGNING_SECRET || "",
  ORCHESTRATOR_URL: process.env.ORCHESTRATOR_URL || "",
  CUSTOM_KEY: process.env.CUSTOM_KEY || "",
}

// Client-safe environment variables only
export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_BFF_URL: env.NEXT_PUBLIC_BFF_URL,
  NEXT_PUBLIC_VERCEL_URL: env.NEXT_PUBLIC_VERCEL_URL,
  NEXT_PUBLIC_MAKE_WEBHOOK_URL: env.NEXT_PUBLIC_MAKE_WEBHOOK_URL,
}

// Validation function - only warn in development, don't throw
export function validateEnv() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  const missing = required.filter((key) => !env[key as keyof typeof env])

  if (missing.length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`)
      console.warn("⚠️  Some features may not work correctly")
      return false
    } else {
      console.error(`❌ Missing required environment variables: ${missing.join(", ")}`)
      return false
    }
  }

  return true
}

// Get base URL for API calls
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  if (env.NEXT_PUBLIC_BFF_URL) {
    return env.NEXT_PUBLIC_BFF_URL.startsWith("http") ? env.NEXT_PUBLIC_BFF_URL : `https://${env.NEXT_PUBLIC_BFF_URL}`
  }

  if (env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${env.NEXT_PUBLIC_VERCEL_URL}`
  }

  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL
  }

  return "http://localhost:3000"
}
