import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id") || "demo-user-123"

    // Check if user has used their free reveal in the last 24 hours
    const { data: recentSessions, error } = await supabase
      .from("serendipity_sessions")
      .select("id, created_at")
      .eq("user_id", user_id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      throw error
    }

    // Get user tier (mock - in real app, get from user_profiles)
    const userTier = "free_agent" // Mock free tier

    const hasUsedFreeReveal = userTier === "free_agent" && recentSessions && recentSessions.length > 0

    return NextResponse.json({
      hasUsedFreeReveal,
      userTier,
      recentSessionCount: recentSessions?.length || 0,
      nextResetTime: userTier === "free_agent" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    })
  } catch (error) {
    console.error("Error checking usage:", error)
    return NextResponse.json({ error: "Failed to check usage" }, { status: 500 })
  }
}
