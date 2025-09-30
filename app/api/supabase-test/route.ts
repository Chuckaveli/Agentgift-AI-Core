import { type NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient, isSupabaseConfigured } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Supabase is not configured",
        message: "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables",
        configured: false,
      })
    }

    // Test client connection
    const client = createClient()
    const { data: clientData, error: clientError } = await client.from("users").select("count").limit(1)

    // Test admin connection
    const adminClient = createAdminClient()
    const { data: adminData, error: adminError } = await adminClient.from("users").select("count").limit(1)

    // Test auth
    const { data: authData, error: authError } = await client.auth.getSession()

    return NextResponse.json({
      success: true,
      configured: true,
      tests: {
        client: {
          success: !clientError,
          error: clientError?.message || null,
          data: clientData,
        },
        admin: {
          success: !adminError,
          error: adminError?.message || null,
          data: adminData,
        },
        auth: {
          success: !authError,
          error: authError?.message || null,
          session: !!authData?.session,
        },
      },
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      configured: isSupabaseConfigured(),
    })
  }
}
