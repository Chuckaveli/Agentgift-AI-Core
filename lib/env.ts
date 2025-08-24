// Environment variables with proper validation and fallbacks
export const env = {
  // Required Supabase variables - these must be set in production
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Site configuration
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000",
  NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL || "",
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

// Check if a value is a placeholder
function isPlaceholder(value: string): boolean {
  const placeholders = [
    "your-supabase-url-here",
    "your-supabase-anon-key-here",
    "your-service-role-key-here",
    "placeholder",
    "example.com",
    "",
  ]
  return placeholders.some((placeholder) => value.toLowerCase().includes(placeholder.toLowerCase())) || !value
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check for missing or placeholder values
  if (!supabaseUrl || isPlaceholder(supabaseUrl)) {
    return false
  }

  if (!supabaseAnonKey || isPlaceholder(supabaseAnonKey)) {
    return false
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
    return true
  } catch (error) {
    return false
  }
}

// Validation function - only warn, don't throw
export function validateEnv() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isSupabaseConfigured()) {
    const message = `Supabase is not properly configured. Please set valid environment variables:
    - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || "not set"}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "[hidden]" : "not set"}`

    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  ${message}`)
      console.warn("⚠️  The application will use a mock Supabase client")
    } else {
      console.error(`❌ ${message}`)
    }
    return false
  }

  return true
}

// Get base URL for API calls
export function getBaseUrl() {
  let baseUrl = "http://localhost:3000"

  if (typeof window !== "undefined") {
    baseUrl = window.location.origin
  } else {
    if (env.NEXT_PUBLIC_BFF_URL && !isPlaceholder(env.NEXT_PUBLIC_BFF_URL)) {
      try {
        baseUrl = new URL(env.NEXT_PUBLIC_BFF_URL).origin
      } catch (error) {
        console.error("❌ Invalid NEXT_PUBLIC_BFF_URL:", env.NEXT_PUBLIC_BFF_URL, error)
      }
    } else if (env.NEXT_PUBLIC_VERCEL_URL && !isPlaceholder(env.NEXT_PUBLIC_VERCEL_URL)) {
      baseUrl = `https://${env.NEXT_PUBLIC_VERCEL_URL}`
    } else if (env.NEXT_PUBLIC_SITE_URL && !isPlaceholder(env.NEXT_PUBLIC_SITE_URL)) {
      baseUrl = env.NEXT_PUBLIC_SITE_URL
    }
  }

  return baseUrl
}
