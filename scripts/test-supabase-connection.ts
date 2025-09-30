import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...\n")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("📋 Environment Variables:")
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`)
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✅ Set" : "❌ Missing"}`)
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✅ Set" : "❌ Missing"}\n`)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing required environment variables")
    console.log("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file")
    process.exit(1)
  }

  try {
    // Test client connection
    console.log("🔗 Testing client connection...")
    const client = createClient(supabaseUrl, supabaseAnonKey)

    const { data: clientData, error: clientError } = await client.from("users").select("count").limit(1)

    if (clientError) {
      console.log(`❌ Client connection failed: ${clientError.message}`)
    } else {
      console.log("✅ Client connection successful")
    }

    // Test admin connection
    if (supabaseServiceKey) {
      console.log("🔗 Testing admin connection...")
      const adminClient = createClient(supabaseUrl, supabaseServiceKey)

      const { data: adminData, error: adminError } = await adminClient.from("users").select("count").limit(1)

      if (adminError) {
        console.log(`❌ Admin connection failed: ${adminError.message}`)
      } else {
        console.log("✅ Admin connection successful")
      }
    }

    // Test auth
    console.log("🔐 Testing auth service...")
    const { data: authData, error: authError } = await client.auth.getSession()

    if (authError) {
      console.log(`❌ Auth service failed: ${authError.message}`)
    } else {
      console.log("✅ Auth service working")
      console.log(`Session: ${authData.session ? "Active" : "None"}`)
    }

    console.log("\n🎉 Connection test completed!")
  } catch (error) {
    console.error("❌ Connection test failed:", error)
    process.exit(1)
  }
}

// Run the test
testSupabaseConnection()
