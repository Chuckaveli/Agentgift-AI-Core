import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check for sessions in current calendar year
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1).toISOString()
    const yearEnd = new Date(currentYear + 1, 0, 1).toISOString()

    const { data: sessions, error } = await supabase
      .from("bondcraft_sessions")
      .select("id, created_at")
      .eq("user_id", user_id)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd)

    if (error) {
      console.error("Error checking usage:", error)
      return NextResponse.json({ error: "Failed to check usage" }, { status: 500 })
    }

    return NextResponse.json({
      has_used_yearly: sessions && sessions.length > 0,
      sessions_this_year: sessions?.length || 0,
      last_session: sessions?.[0]?.created_at || null,
    })
  } catch (error) {
    console.error("Error in check-usage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
