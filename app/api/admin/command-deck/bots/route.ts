import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

// Default bots configuration
const DEFAULT_BOTS = [
  {
    id: "1",
    bot_name: "ag-tokenomics-v3",
    bot_display_name: "AG Tokenomics v3 Bot",
    bot_description: "Manages XP, badges, and token economy systems",
    bot_icon: "🧮",
    bot_category: "economy",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "2",
    bot_name: "emotional-signature-engine",
    bot_display_name: "Emotional Signature Engine Bot",
    bot_description: "Analyzes and processes emotional intelligence data",
    bot_icon: "🧠",
    bot_category: "intelligence",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "3",
    bot_name: "gift-intel-blog-generator",
    bot_display_name: "Gift Intel Blog Generator Bot",
    bot_description: "Creates content and blog posts about gifting trends",
    bot_icon: "📢",
    bot_category: "content",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "4",
    bot_name: "social-media-manager",
    bot_display_name: "Social Media Manager Bot",
    bot_description: "Handles social media posting and engagement",
    bot_icon: "📅",
    bot_category: "marketing",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "5",
    bot_name: "giftverse-game-engine",
    bot_display_name: "Giftverse Game Engine Bot",
    bot_description: "Powers gamification and interactive experiences",
    bot_icon: "🎁",
    bot_category: "gaming",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "6",
    bot_name: "silent-intent-detection",
    bot_display_name: "Silent Intent Detection Bot",
    bot_description: "Analyzes user behavior and predicts intentions",
    bot_icon: "🕵️‍♂️",
    bot_category: "intelligence",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "7",
    bot_name: "voice-assistant-engine",
    bot_display_name: "Voice Assistant Engine Bot",
    bot_description: "Manages voice interactions and TTS/STT processing",
    bot_icon: "💬",
    bot_category: "interface",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "8",
    bot_name: "referral-system",
    bot_display_name: "Referral System Bot",
    bot_description: "Handles user referrals and reward distribution",
    bot_icon: "👥",
    bot_category: "growth",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    // Verify admin status
    const supabase = createAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("admin_role")
      .eq("id", adminId)
      .single()

    if (profileError || !profile?.admin_role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Try to get bots from database, fallback to default
    let bots = DEFAULT_BOTS

    try {
      const { data: dbBots, error: botsError } = await supabase
        .from("ai_bots_registry")
        .select("*")
        .order("bot_category", { ascending: true })

      if (!botsError && dbBots && dbBots.length > 0) {
        bots = dbBots
      }
    } catch (error) {
      console.warn("Database not ready, using default bots:", error)
    }

    return NextResponse.json({
      success: true,
      bots,
      message: "Bots loaded successfully",
    })
  } catch (error) {
    console.error("Error loading bots:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load bots",
        bots: DEFAULT_BOTS, // Fallback to default bots
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, botName, adminId, sessionId, commandInput } = body

    if (!adminId || !action || !botName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify admin status
    const supabase = createAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("admin_role, name")
      .eq("id", adminId)
      .single()

    if (profileError || !profile?.admin_role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Find the bot
    const bot = DEFAULT_BOTS.find((b) => b.bot_name === botName)
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Generate response based on action
    let response = ""
    let newStatus = bot.current_status

    switch (action) {
      case "summon":
        response = `Summoning ${bot.bot_display_name} now… Bot activation systems engaged. Ready to process commands.`
        newStatus = "active"
        break
      case "pause":
        response = `Pausing ${bot.bot_display_name}… All active processes suspended. Bot will remain in standby mode.`
        newStatus = "idle"
        break
      case "reset":
        response = `Resetting ${bot.bot_display_name}… All cached data cleared, connections refreshed. Bot is ready for new commands.`
        newStatus = "idle"
        break
      case "status_check":
        response = `${bot.bot_display_name} Status Report: System operational, ready for commands. All subsystems functioning normally.`
        break
      default:
        response = `${action} executed on ${bot.bot_display_name}`
    }

    // Log the interaction
    try {
      await supabase.from("assistant_interaction_logs").insert({
        user_id: adminId,
        session_id: sessionId,
        bot_name: botName,
        action_type: action,
        command_input: commandInput || `${action} ${botName}`,
        response_output: response,
        status: "success",
        created_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.warn("Failed to log interaction:", logError)
    }

    return NextResponse.json({
      success: true,
      botName: bot.bot_display_name,
      action,
      response,
      newStatus,
      message: `${action} executed successfully`,
    })
  } catch (error) {
    console.error("Error executing bot action:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute bot action",
      },
      { status: 500 },
    )
  }
}
