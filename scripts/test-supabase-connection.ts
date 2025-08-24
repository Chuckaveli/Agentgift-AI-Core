import { createClient } from "@/lib/supabase-client"
import { createAdminClient } from "@/lib/supabase-client"

export async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...\n")

  try {
    // Test client connection
    const client = createClient()
    console.log("✅ Supabase client created successfully")

    // Test admin connection
    const adminClient = createAdminClient()
    console.log("✅ Supabase admin client created successfully")

    // Test a simple query (this will work even with mock clients)
    const { data, error } = await client.from("profiles").select("count").limit(1)

    if (error && error.message.includes("Mock client")) {
      console.log("⚠️  Using mock client - environment variables may be missing")
      return false
    } else if (error) {
      console.log("⚠️  Database query failed:", error.message)
      console.log("   This might be normal if tables don't exist yet")
    } else {
      console.log("✅ Database connection successful")
    }

    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}
