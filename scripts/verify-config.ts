import dotenv from "dotenv"
import path from "path"
import fs from "fs"

// Load environment variables
dotenv.config({ path: ".env.local" })

interface ConfigCheck {
  name: string
  value: string | undefined
  required: boolean
  description: string
}

const requiredConfigs: ConfigCheck[] = [
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
    required: false,
    description: "Backend for Frontend URL",
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    value: process.env.NEXT_PUBLIC_SITE_URL,
    required: false,
    description: "Site URL for redirects",
  },
]

function verifyConfig() {
  console.log("🔍 Verifying AgentGift.ai Configuration...\n")

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!")
    console.log("📝 Please create .env.local file with your environment variables\n")
    return false
  }

  let allValid = true
  const issues: string[] = []

  requiredConfigs.forEach((config) => {
    const status = config.value ? "✅" : config.required ? "❌" : "⚠️"
    const statusText = config.value ? "SET" : config.required ? "MISSING" : "OPTIONAL"

    console.log(`${status} ${config.name}: ${statusText}`)
    console.log(`   Description: ${config.description}`)

    if (config.value) {
      // Mask sensitive values
      const maskedValue =
        config.name.includes("KEY") || config.name.includes("SECRET")
          ? `${config.value.substring(0, 8)}...`
          : config.value
      console.log(`   Value: ${maskedValue}`)
    }

    console.log("")

    if (config.required && !config.value) {
      allValid = false
      issues.push(`Missing required variable: ${config.name}`)
    }
  })

  // Additional checks
  console.log("🔧 Additional Checks:")

  // Check Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
    console.log("⚠️  Supabase URL should start with https://")
    issues.push("Supabase URL format issue")
  } else if (supabaseUrl) {
    console.log("✅ Supabase URL format is valid")
  }

  // Check BFF URL format if provided
  const bffUrl = process.env.NEXT_PUBLIC_BFF_URL
  if (bffUrl && !bffUrl.startsWith("http")) {
    console.log("⚠️  BFF URL should start with http:// or https://")
    issues.push("BFF URL format issue")
  } else if (bffUrl) {
    console.log("✅ BFF URL format is valid")
  }

  console.log("")

  if (allValid && issues.length === 0) {
    console.log("🎉 Configuration verification passed!")
    console.log("✅ All required environment variables are set")
    return true
  } else {
    console.log("❌ Configuration verification failed!")
    console.log("\n📋 Issues found:")
    issues.forEach((issue) => console.log(`   • ${issue}`))
    console.log("\n💡 Next steps:")
    console.log("   1. Check your .env.local file")
    console.log("   2. Ensure all required variables are set")
    console.log("   3. Verify variable formats are correct")
    console.log("   4. Restart your development server after making changes")
    return false
  }
}

// Run verification
const isValid = verifyConfig()
process.exit(isValid ? 0 : 1)
