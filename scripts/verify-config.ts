#!/usr/bin/env node

import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })

interface ConfigCheck {
  name: string
  value: string | undefined
  required: boolean
  description: string
}

const requiredConfig: ConfigCheck[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    required: true,
    description: "Supabase project URL",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    required: true,
    description: "Supabase anonymous key",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    required: true,
    description: "Supabase service role key (server-side)",
  },
  {
    name: "NEXT_PUBLIC_BFF_URL",
    value: process.env.NEXT_PUBLIC_BFF_URL,
    required: true,
    description: "Backend for Frontend URL",
  },
  {
    name: "OPENAI_API_KEY",
    value: process.env.OPENAI_API_KEY,
    required: false,
    description: "OpenAI API key for AI features",
  },
  {
    name: "ELEVENLABS_API_KEY",
    value: process.env.ELEVENLABS_API_KEY,
    required: false,
    description: "ElevenLabs API key for voice features",
  },
]

console.log("🔍 AgentGift.ai Configuration Verification\n")

let hasErrors = false
let hasWarnings = false

requiredConfig.forEach((config) => {
  const status = config.value ? "✅" : config.required ? "❌" : "⚠️"
  const statusText = config.value ? "SET" : config.required ? "MISSING" : "OPTIONAL"

  console.log(`${status} ${config.name}: ${statusText}`)
  console.log(`   Description: ${config.description}`)

  if (config.value) {
    // Validate URL format for URL-based configs
    if (config.name.includes("URL")) {
      try {
        new URL(config.value)
        console.log(`   Value: ${config.value}`)
      } catch (error) {
        console.log(`   ❌ Invalid URL format: ${config.value}`)
        hasErrors = true
      }
    } else {
      // Show partial value for security
      const maskedValue = config.value.length > 10 ? `${config.value.substring(0, 10)}...` : config.value
      console.log(`   Value: ${maskedValue}`)
    }
  }

  if (!config.value && config.required) {
    hasErrors = true
  } else if (!config.value && !config.required) {
    hasWarnings = true
  }

  console.log("")
})

// Summary
console.log("📋 Summary:")
if (hasErrors) {
  console.log("❌ Configuration has errors. Please fix missing required variables.")
  process.exit(1)
} else if (hasWarnings) {
  console.log("⚠️  Configuration is valid but some optional features may not work.")
  console.log("✅ Ready to start development server!")
} else {
  console.log("✅ All configuration is valid!")
}

console.log('\n🚀 Run "npm run dev" to start the development server.')
