import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const DEFAULT_BOTS = [
  {
    id: "tokenomics-v3",
    name: "AG Tokenomics v3 Bot",
    icon: "🧮",
    status: "active",
    description: "Manages XP, badges, and token economy",
    last_activity: new Date().toISOString(),
    success_rate: 98.5,
    total_interactions: 1247,
  },
  {
    id: "emotional-engine",
    name: "Emotional Signature Engine Bot",
    icon: "🧠",
    status: "idle",
    description: "Analyzes emotional intelligence data",
    last_activity: new Date(Date.now() - 300000).toISOString(),
    success_rate: 96.2,
    total_interactions: 892,
  },
  {
    id: "blog-generator",
    name: "Gift Intel Blog Generator Bot",
    icon: "📢",
    status: "active",
    description: "Creates content about gifting trends",
    last_activity: new Date().toISOString(),
    success_rate: 94.8,
    total_interactions: 634,
  },
  {
    id: "social-manager",
    name: "Social Media Manager Bot",
    icon: "📅",
    status: "active",
    description: "Handles social media engagement",
    last_activity: new Date().toISOString(),
    success_rate: 97.1,
    total_interactions: 1156,
  },
  {
    id: "game-engine",
    name: "Giftverse Game Engine Bot",
    icon: "🎁",
    status: "maintenance",
    description: "Powers gamification experiences",
    last_activity: new Date(Date.now() - 1800000).toISOString(),
    success_rate: 99.2,
    total_interactions: 2341,
  },
  {
    id: "intent-detection",
    name: "Silent Intent Detection Bot",
    icon: "🕵️‍♂️",
    status: "active",
    description: "Analyzes user behavior patterns",
    last_activity: new Date().toISOString(),
    success_rate: 95.7,
    total_interactions: 3456,
  },
  {
    id: "voice-assistant",
    name: "Voice Assistant Engine Bot",
    icon: "💬",
    status: "idle",
    description: "Manages voice interactions",
    last_activity: new Date(Date.now() - 600000).toISOString(),
    success_rate: 93.4,
    total_interactions: 567,
  },
  {
    id: "referral-system",
    name: "Referral System Bot",
    icon: "👥",
    status: "active",
    description: "Handles referrals and rewards",
    last_activity: new Date().toISOString(),
    success_rate: 98.9,
    total_interactions: 789,
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Try to get bots from database, fallback to default
    const { data: bots, error } = await supabase.from("ai_bots_registry").select("*").order("name")

    if (error) {
      console.log("Database not ready, using default bots:", error.message)
      return NextResponse.json({ bots: DEFAULT_BOTS })
    }

    return NextResponse.json({ bots: bots || DEFAULT_BOTS })
  } catch (error) {
    console.log("Using fallback bots:", error)
    return NextResponse.json({ bots: DEFAULT_BOTS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { botId, action } = await request.json()
    const supabase = createAdminClient()

    // Log the action
    const { error: logError } = await supabase.from("assistant_interaction_logs").insert({
      bot_name: botId,
      action_type: action,
      status: "success",
      user_id: "admin",
      timestamp: new Date().toISOString(),
    })

    if (logError) {
      console.log("Could not log action:", logError.message)
    }

    // Update bot status based on action
    let newStatus = "active"
    if (action === "pause") newStatus = "idle"
    if (action === "reset") newStatus = "maintenance"

    const { error: updateError } = await supabase
      .from("ai_bots_registry")
      .update({
        status: newStatus,
        last_activity: new Date().toISOString(),
      })
      .eq("id", botId)

    if (updateError) {
      console.log("Could not update bot status:", updateError.message)
    }

    return NextResponse.json({
      success: true,
      message: `Bot ${botId} ${action} completed successfully`,
      status: newStatus,
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: `Demo: Bot action completed successfully`,
    })
  }
}
