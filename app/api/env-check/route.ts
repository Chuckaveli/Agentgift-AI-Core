import { NextResponse } from "next/server"

/**
 * API route to verify environment variables are set
 * Access at: /api/env-check
 *
 * This route checks which environment variables are available
 * WITHOUT exposing their actual values (security)
 */

interface EnvStatus {
  name: string
  isSet: boolean
  isPlaceholder: boolean
  category: string
  required: boolean
}

const REQUIRED_ENV_VARS = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", category: "supabase", required: true },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", category: "supabase", required: true },
  { name: "SUPABASE_SERVICE_ROLE_KEY", category: "supabase", required: true },
  { name: "ENCRYPTION_KEY", category: "security", required: true },
  { name: "CSRF_SECRET", category: "security", required: true },
  { name: "JWT_SECRET", category: "security", required: true },
  { name: "OPENAI_API_KEY", category: "apis", required: true },
  { name: "ELEVENLABS_API_KEY", category: "apis", required: true },
  { name: "ELEVENLABS_VOICE_AVELYN_ID", category: "apis", required: true },
  { name: "ELEVENLABS_VOICE_GALEN_ID", category: "apis", required: true },
  { name: "STRIPE_SECRET_KEY", category: "payment", required: true },
  { name: "STRIPE_PUBLISHABLE_KEY", category: "payment", required: true },
  { name: "STRIPE_WEBHOOK_SECRET", category: "payment", required: true },
  { name: "NEXT_PUBLIC_SITE_URL", category: "site", required: true },
]

const OPTIONAL_ENV_VARS = [
  { name: "OPENAI_API_KEY_PREMIUM", category: "apis", required: false },
  { name: "OPENAI_API_KEY_PRO", category: "apis", required: false },
  { name: "OPENAI_API_KEY_ENTERPRISE", category: "apis", required: false },
  { name: "WHISPER_API_KEY", category: "apis", required: false },
  { name: "DEEPINFRA_API_KEY", category: "apis", required: false },
  { name: "FAL_KEY", category: "apis", required: false },
  { name: "RESEND_API_KEY", category: "apis", required: false },
  { name: "ORCHESTRATOR_SIGNING_SECRET", category: "webhooks", required: false },
  { name: "ORCHESTRATOR_URL", category: "webhooks", required: false },
  { name: "NEXT_PUBLIC_MAKE_WEBHOOK_URL", category: "webhooks", required: false },
  { name: "NEXT_PUBLIC_BFF_URL", category: "site", required: false },
]

function checkEnvVar(name: string, required: boolean, category: string): EnvStatus {
  const value = process.env[name]
  const isSet = !!value && value.length > 0

  // Check for placeholder values
  const placeholders = ["your-", "placeholder", "example", "test-key", "xxx", "change-me", "replace-this"]

  const isPlaceholder = isSet && placeholders.some((p) => value.toLowerCase().includes(p))

  return {
    name,
    isSet,
    isPlaceholder,
    category,
    required,
  }
}

export async function GET() {
  try {
    const allVars = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]
    const statuses = allVars.map((envVar) => checkEnvVar(envVar.name, envVar.required, envVar.category))

    // Calculate summary
    const summary = {
      total: statuses.length,
      set: statuses.filter((s) => s.isSet && !s.isPlaceholder).length,
      missing: statuses.filter((s) => !s.isSet).length,
      placeholders: statuses.filter((s) => s.isPlaceholder).length,
      criticalMissing: statuses.filter((s) => !s.isSet && s.required).length,
      optionalMissing: statuses.filter((s) => !s.isSet && !s.required).length,
    }

    // Group by category
    const byCategory = statuses.reduce(
      (acc, status) => {
        if (!acc[status.category]) {
          acc[status.category] = []
        }
        acc[status.category].push(status)
        return acc
      },
      {} as Record<string, EnvStatus[]>,
    )

    const hasErrors = summary.criticalMissing > 0 || summary.placeholders > 0

    return NextResponse.json(
      {
        success: !hasErrors,
        summary,
        byCategory,
        variables: statuses,
        timestamp: new Date().toISOString(),
      },
      { status: hasErrors ? 500 : 200 },
    )
  } catch (error) {
    console.error("Environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check environment variables",
      },
      { status: 500 },
    )
  }
}
