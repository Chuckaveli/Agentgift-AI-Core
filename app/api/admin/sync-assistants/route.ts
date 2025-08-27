import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { syncAssistantsToRegistry, AGENTGIFT_ASSISTANTS } from "@/lib/assistant-sync"
import { withAdmin } from '@/lib/with-admin';

// This API route provides server-side access to the sync function
// It ensures the service role key is only used on the server
async function __orig_POST(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 })
    }

    // Verify the user is an admin
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("user_profiles").select("role, email").eq("id", user.id).single()

    if (!profile || (profile.role !== "admin" && profile.email !== "admin@agentgift.ai")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse request body for custom assistants or use defaults
    let assistantsToSync = AGENTGIFT_ASSISTANTS

    try {
      const body = await request.json()
      if (body.assistants && Array.isArray(body.assistants)) {
        assistantsToSync = body.assistants
      }
    } catch {
      // Use default assistants if no body or invalid JSON
    }

    // Perform the sync
    const result = await syncAssistantsToRegistry(assistantsToSync)

    return NextResponse.json({
      success: true,
      message: "Assistant registry sync completed",
      ...result,
    })
  } catch (error) {
    console.error("Admin sync assistants error:", error)

    return NextResponse.json(
      {
        error: "Failed to sync assistants",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function __orig_GET(request: NextRequest) {
  try {
    // Verify admin access (same as POST)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("user_profiles").select("role, email").eq("id", user.id).single()

    if (!profile || (profile.role !== "admin" && profile.email !== "admin@agentgift.ai")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Fetch current assistant registry
    const { data: assistants, error } = await supabase
      .from("assistant_registry")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      assistants,
      count: assistants.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin fetch assistants error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch assistants",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

const __orig_GET = withAdmin(__orig_GET);
export const GET = withAdmin(__orig_GET);
const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
