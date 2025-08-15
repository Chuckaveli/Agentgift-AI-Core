import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env.server"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || "", env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, persona, conversationData, moodAnalysis, recommendations, creditsUsed, sessionDuration } = body

    if (!userId || !persona || !conversationData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: conversation, error } = await supabase
      .from("ai_companion_conversations")
      .insert({
        user_id: userId,
        persona,
        conversation_data: conversationData,
        mood_analysis: moodAnalysis,
        recommendations,
        credits_used: creditsUsed || 1,
        session_duration: sessionDuration,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving conversation:", error)
      return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: conversations, error } = await supabase
      .from("ai_companion_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
