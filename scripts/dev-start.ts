#!/usr/bin/env node

import { spawn } from "child_process"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })

console.log("🚀 Starting AgentGift.ai Development Server...\n")

// Check critical environment variables
const criticalVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_BFF_URL"]

const missingVars = criticalVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.log("❌ Missing critical environment variables:")
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`)
  })
  console.log("\nPlease check your .env.local file and try again.")
  process.exit(1)
}

// Validate BFF URL format
try {
  new URL(process.env.NEXT_PUBLIC_BFF_URL!)
  console.log(`✅ BFF URL is valid: ${process.env.NEXT_PUBLIC_BFF_URL}`)
} catch (error) {
  console.log(`❌ Invalid BFF URL format: ${process.env.NEXT_PUBLIC_BFF_URL}`)
  process.exit(1)
}

console.log("✅ Environment configuration looks good!")
console.log("🔄 Starting Next.js development server...\n")

// Start the Next.js development server
const nextDev = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
})

nextDev.on("close", (code) => {
  console.log(`\n🛑 Development server exited with code ${code}`)
})

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development server...")
  nextDev.kill("SIGINT")
})

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down development server...")
  nextDev.kill("SIGTERM")
})
