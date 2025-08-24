#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Testing Environment Variables...\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.log("❌ .env.local file not found!")
  console.log("📝 Please create a .env.local file with your environment variables.")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: envPath })

// Required variables for basic functionality
const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

// Optional but recommended variables
const optionalVars = ["NEXT_PUBLIC_BFF_URL", "NEXT_PUBLIC_SITE_URL", "OPENAI_API_KEY", "ELEVENLABS_API_KEY"]

let hasErrors = false

console.log("✅ Required Variables:")
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`  ✓ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`  ❌ ${varName}: MISSING`)
    hasErrors = true
  }
})

console.log("\n📋 Optional Variables:")
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`  ✓ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`  ⚠️  ${varName}: Not set`)
  }
})

// Test Supabase URL format
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    console.log("\n❌ NEXT_PUBLIC_SUPABASE_URL format appears incorrect")
    console.log("   Expected format: https://your-project-id.supabase.co")
    hasErrors = true
  } else {
    console.log("\n✅ Supabase URL format looks correct")
  }
}

// Test Supabase anon key format
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key.startsWith("eyJ")) {
    console.log("\n❌ NEXT_PUBLIC_SUPABASE_ANON_KEY format appears incorrect")
    console.log("   Expected to start with: eyJ")
    hasErrors = true
  } else {
    console.log("\n✅ Supabase anon key format looks correct")
  }
}

if (hasErrors) {
  console.log("\n❌ Please fix the missing or incorrect environment variables before running the project.")
  process.exit(1)
} else {
  console.log("\n🎉 Environment setup looks good! You can now run the project.")
  console.log("\nNext steps:")
  console.log("  npm run dev    # Start development server")
  console.log("  npm run build  # Test production build")
}
