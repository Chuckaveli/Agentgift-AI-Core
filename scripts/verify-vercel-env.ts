#!/usr/bin/env node

/**
 * Script to verify all required environment variables are set
 * Run with: npx tsx scripts/verify-vercel-env.ts
 */

import { createClient } from "@supabase/supabase-js"

interface EnvCheck {
  name: string
  required: boolean
  description: string
  example: string
  category: "supabase" | "security" | "apis" | "webhooks" | "site" | "payment"
}

const ENV_CHECKS: EnvCheck[] = [
  // Supabase - CRITICAL
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "Supabase project URL",
    example: "https://xxxxx.supabase.co",
    category: "supabase",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    description: "Supabase anonymous key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    category: "supabase",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    description: "Supabase service role key (server-side only)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    category: "supabase",
  },

  // Security - CRITICAL
  {
    name: "ENCRYPTION_KEY",
    required: true,
    description: "64-character hex encryption key",
    example: "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    category: "security",
  },
  {
    name: "CSRF_SECRET",
    required: true,
    description: "CSRF token secret",
    example: "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    category: "security",
  },
  {
    name: "JWT_SECRET",
    required: true,
    description: "JWT signing secret",
    example: "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    category: "security",
  },

  // OpenAI - REQUIRED for AI features
  {
    name: "OPENAI_API_KEY",
    required: true,
    description: "OpenAI API key for basic tier",
    example: "sk-proj-...",
    category: "apis",
  },
  {
    name: "OPENAI_API_KEY_PREMIUM",
    required: false,
    description: "OpenAI API key for premium tier",
    example: "sk-proj-...",
    category: "apis",
  },
  {
    name: "OPENAI_API_KEY_PRO",
    required: false,
    description: "OpenAI API key for pro tier",
    example: "sk-proj-...",
    category: "apis",
  },
  {
    name: "OPENAI_API_KEY_ENTERPRISE",
    required: false,
    description: "OpenAI API key for enterprise tier",
    example: "sk-proj-...",
    category: "apis",
  },

  // ElevenLabs - Server-side ONLY
  {
    name: "ELEVENLABS_API_KEY",
    required: true,
    description: "ElevenLabs API key (NEVER client-side)",
    example: "sk_...",
    category: "apis",
  },
  {
    name: "ELEVENLABS_VOICE_AVELYN_ID",
    required: true,
    description: "Voice ID for Avelyn character",
    example: "AbCdEfGh...",
    category: "apis",
  },
  {
    name: "ELEVENLABS_VOICE_GALEN_ID",
    required: true,
    description: "Voice ID for Galen character",
    example: "XyZaBcDe...",
    category: "apis",
  },

  // Other APIs
  {
    name: "WHISPER_API_KEY",
    required: false,
    description: "Whisper API for speech-to-text",
    example: "sk-...",
    category: "apis",
  },
  {
    name: "DEEPINFRA_API_KEY",
    required: false,
    description: "DeepInfra API key",
    example: "your-api-key",
    category: "apis",
  },
  {
    name: "FAL_KEY",
    required: false,
    description: "Fal.ai API key",
    example: "your-fal-key",
    category: "apis",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API for email",
    example: "re_...",
    category: "apis",
  },

  // Stripe - REQUIRED for payments
  {
    name: "STRIPE_SECRET_KEY",
    required: true,
    description: "Stripe secret key",
    example: "sk_test_... or sk_live_...",
    category: "payment",
  },
  {
    name: "STRIPE_PUBLISHABLE_KEY",
    required: true,
    description: "Stripe publishable key",
    example: "pk_test_... or pk_live_...",
    category: "payment",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: true,
    description: "Stripe webhook signing secret",
    example: "whsec_...",
    category: "payment",
  },

  // Webhooks & Integrations
  {
    name: "ORCHESTRATOR_SIGNING_SECRET",
    required: false,
    description: "Orchestrator webhook signing secret",
    example: "Generate random string",
    category: "webhooks",
  },
  {
    name: "ORCHESTRATOR_URL",
    required: false,
    description: "Orchestrator service URL",
    example: "https://orchestrator.vercel.app",
    category: "webhooks",
  },
  {
    name: "NEXT_PUBLIC_MAKE_WEBHOOK_URL",
    required: false,
    description: "Make.com webhook URL",
    example: "https://hook.us1.make.com/...",
    category: "webhooks",
  },

  // Site Configuration
  {
    name: "NEXT_PUBLIC_SITE_URL",
    required: true,
    description: "Your site URL",
    example: "https://agentgift.ai",
    category: "site",
  },
  {
    name: "NEXT_PUBLIC_BFF_URL",
    required: false,
    description: "Backend-for-frontend URL",
    example: "https://bff.agentgift.ai",
    category: "site",
  },
]

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function checkEnvVar(check: EnvCheck): { missing: boolean; isPlaceholder: boolean; value?: string } {
  const value = process.env[check.name]

  if (!value) {
    return { missing: true, isPlaceholder: false }
  }

  // Check for common placeholder values
  const placeholders = ["your-", "placeholder", "example", "test-key", "xxx", "change-me", "replace-this"]

  const isPlaceholder = placeholders.some((placeholder) => value.toLowerCase().includes(placeholder))

  return { missing: false, isPlaceholder, value }
}

async function verifySupabaseConnection(): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { error } = await supabase.from("profiles").select("count").limit(1)

    return !error
  } catch {
    return false
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}🔍 AgentGift.ai Environment Variables Check${colors.reset}\n`)

  const results: {
    critical: EnvCheck[]
    optional: EnvCheck[]
    placeholders: EnvCheck[]
  } = {
    critical: [],
    optional: [],
    placeholders: [],
  }

  // Check all environment variables
  for (const check of ENV_CHECKS) {
    const result = checkEnvVar(check)

    if (result.missing && check.required) {
      results.critical.push(check)
    } else if (result.isPlaceholder) {
      results.placeholders.push(check)
    } else if (result.missing && !check.required) {
      results.optional.push(check)
    }
  }

  // Display results by category
  const categories = ["supabase", "security", "payment", "apis", "webhooks", "site"] as const

  for (const category of categories) {
    const categoryChecks = ENV_CHECKS.filter((check) => check.category === category)
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

    console.log(`${colors.bright}${colors.blue}📦 ${categoryName}${colors.reset}`)

    for (const check of categoryChecks) {
      const result = checkEnvVar(check)
      let status = ""
      let icon = ""

      if (result.missing) {
        if (check.required) {
          icon = "❌"
          status = `${colors.red}MISSING (REQUIRED)${colors.reset}`
        } else {
          icon = "⚠️ "
          status = `${colors.yellow}Missing (optional)${colors.reset}`
        }
      } else if (result.isPlaceholder) {
        icon = "⚠️ "
        status = `${colors.yellow}PLACEHOLDER DETECTED${colors.reset}`
      } else {
        icon = "✅"
        status = `${colors.green}Set${colors.reset}`
      }

      console.log(`  ${icon} ${check.name}: ${status}`)
    }
    console.log("")
  }

  // Summary
  console.log(`${colors.bright}${colors.cyan}📊 Summary${colors.reset}`)
  console.log(`  ✅ Total checks: ${ENV_CHECKS.length}`)
  console.log(`  ${colors.red}❌ Critical missing: ${results.critical.length}${colors.reset}`)
  console.log(`  ${colors.yellow}⚠️  Placeholders: ${results.placeholders.length}${colors.reset}`)
  console.log(`  ${colors.yellow}⚠️  Optional missing: ${results.optional.length}${colors.reset}\n`)

  // Critical errors
  if (results.critical.length > 0) {
    console.log(`${colors.bright}${colors.red}❌ CRITICAL: Missing Required Variables${colors.reset}\n`)

    for (const check of results.critical) {
      console.log(`  ${colors.red}●${colors.reset} ${colors.bright}${check.name}${colors.reset}`)
      console.log(`    ${check.description}`)
      console.log(`    Example: ${colors.cyan}${check.example}${colors.reset}\n`)
    }

    console.log(
      `${colors.yellow}⚠️  Set these in Vercel: https://vercel.com/dashboard/[your-project]/settings/environment-variables${colors.reset}\n`,
    )
  }

  // Placeholder warnings
  if (results.placeholders.length > 0) {
    console.log(`${colors.bright}${colors.yellow}⚠️  WARNING: Placeholder Values Detected${colors.reset}\n`)

    for (const check of results.placeholders) {
      console.log(`  ${colors.yellow}●${colors.reset} ${colors.bright}${check.name}${colors.reset}`)
      console.log(`    Replace with actual value`)
      console.log(`    Example: ${colors.cyan}${check.example}${colors.reset}\n`)
    }
  }

  // Test Supabase connection
  console.log(`${colors.bright}${colors.cyan}🔌 Testing Supabase Connection...${colors.reset}`)
  const supabaseWorks = await verifySupabaseConnection()

  if (supabaseWorks) {
    console.log(`  ${colors.green}✅ Supabase connection successful${colors.reset}\n`)
  } else {
    console.log(`  ${colors.red}❌ Supabase connection failed - check URL and keys${colors.reset}\n`)
  }

  // Exit code
  const hasErrors = results.critical.length > 0 || results.placeholders.length > 0 || !supabaseWorks

  if (hasErrors) {
    console.log(`${colors.red}❌ Environment check FAILED${colors.reset}\n`)
    process.exit(1)
  } else {
    console.log(`${colors.green}✅ All environment variables configured correctly!${colors.reset}\n`)
    process.exit(0)
  }
}

main()
