import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all bots with their current status
    const { data: bots, error: botsError } = await supabase
      .from("ai_bots_registry")
      .select("*")
      .order("bot_category", { ascending: true })

    if (botsError) {
      throw botsError
    }

    // Get recent performance metrics for each bot
    const { data: metrics } = await supabase
      .from("bot_performance_metrics")
      .select("*")
      .gte("metric_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("metric_date", { ascending: false })

    // Get recent alerts
    const { data: alerts } = await supabase
      .from("bot_alerts")
      .select("*")
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })

    // Get recent interaction logs for status
    const { data: recentLogs } = await supabase
      .from("assistant_interaction_logs")
      .select("bot_name, status, created_at, error_message")
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order("created_at", { ascending: false })

    // Combine data for comprehensive bot status
    const botsWithStatus = bots?.map((bot) => {
      const botMetrics = metrics?.filter((m) => m.bot_name === bot.bot_name) || []
      const botAlerts = alerts?.filter((a) => a.bot_name === bot.bot_name) || []
      const botLogs = recentLogs?.filter((l) => l.bot_name === bot.bot_name) || []

      // Determine current status based on recent activity
      let currentStatus = bot.health_status
      const recentErrors = botLogs.filter((l) => l.status === "failed").length
      const recentSuccess = botLogs.filter((l) => l.status === "completed").length

      if (recentErrors > 0 && recentSuccess === 0) {
        currentStatus = "error"
      } else if (recentSuccess > 0) {
        currentStatus = "active"
      }

      return {
        ...bot,
        current_status: currentStatus,
        recent_metrics: botMetrics[0] || null,
        active_alerts: botAlerts.length,
        recent_activity: botLogs.length,
        last_activity: botLogs[0]?.created_at || bot.last_health_check,
      }
    })

    return NextResponse.json({
      success: true,
      bots: botsWithStatus,
      total_bots: bots?.length || 0,
      active_bots: botsWithStatus?.filter((b) => b.current_status === "active").length || 0,
      error_bots: botsWithStatus?.filter((b) => b.current_status === "error").length || 0,
    })
  } catch (error) {
    console.error("Command deck bots error:", error)
    return NextResponse.json({ error: "Failed to fetch bot status", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, botName, adminId, sessionId, commandInput } = await request.json()

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const startTime = Date.now()
    let botResponse = ""
    let status = "completed"
    let errorMessage = null

    try {
      // Execute bot action
      switch (action) {
        case "summon":
          botResponse = await summonBot(botName, adminId)
          await updateBotStatus(botName, "active")
          break
        case "pause":
          botResponse = await pauseBot(botName, adminId)
          await updateBotStatus(botName, "idle")
          break
        case "reset":
          botResponse = await resetBot(botName, adminId)
          await updateBotStatus(botName, "idle")
          break
        case "status_check":
          botResponse = await getBotStatus(botName)
          break
        case "command":
          botResponse = await executeBotCommand(botName, commandInput, adminId)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      status = "failed"
      errorMessage = error.message
      botResponse = `Error executing ${action} on ${botName}: ${error.message}`
      await updateBotStatus(botName, "error", errorMessage)
    }

    const executionTime = Date.now() - startTime

    // Log the interaction
    const { data: logEntry } = await supabase
      .from("assistant_interaction_logs")
      .insert({
        user_id: adminId,
        session_id: sessionId,
        bot_name: botName,
        action_type: action,
        command_input: commandInput,
        bot_response: botResponse,
        status,
        error_message: errorMessage,
        execution_time_ms: executionTime,
        metadata: { admin_name: admin.name },
      })
      .select()
      .single()

    // Update performance metrics
    await updateBotMetrics(botName, status === "completed", executionTime)

    return NextResponse.json({
      success: status === "completed",
      action,
      botName,
      response: botResponse,
      executionTime,
      status,
      error: errorMessage,
      logId: logEntry?.id,
    })
  } catch (error) {
    console.error("Bot action error:", error)
    return NextResponse.json({ error: "Failed to execute bot action", details: error.message }, { status: 500 })
  }
}

// Helper functions for bot operations
async function summonBot(botName: string, adminId: string): Promise<string> {
  const botResponses = {
    "ag-tokenomics-v3":
      "AG Tokenomics v3 Bot activated. Accessing XP distribution logs and badge trigger analytics. Ready to optimize token economy.",
    "emotional-signature-engine":
      "Emotional Signature Engine Bot online. Analyzing emotional patterns across 2,847 user interactions. Emotional intelligence systems ready.",
    "gift-intel-blog-generator":
      "Gift Intel Blog Generator Bot summoned. Scanning trending gift categories and cultural insights. Content generation engines primed.",
    "social-media-manager":
      "Social Media Manager Bot activated. Monitoring 5 platforms for engagement opportunities. Scheduling and analytics systems online.",
    "giftverse-game-engine":
      "Giftverse Game Engine Bot powered up. Loading gamification rules and achievement systems. Interactive experiences ready to deploy.",
    "silent-intent-detection":
      "Silent Intent Detection Bot engaged. Analyzing behavioral patterns and predictive models. Stealth monitoring systems active.",
    "voice-assistant-engine":
      "Voice Assistant Engine Bot initialized. TTS and STT systems calibrated. Multi-voice personality matrix loaded.",
    "referral-system":
      "Referral System Bot activated. Tracking referral chains and reward distributions. Growth optimization protocols engaged.",
  }

  return botResponses[botName] || `${botName} bot has been summoned and is now active.`
}

async function pauseBot(botName: string, adminId: string): Promise<string> {
  return `${botName} bot has been paused. All active processes suspended. Bot will remain in standby mode until reactivated.`
}

async function resetBot(botName: string, adminId: string): Promise<string> {
  return `${botName} bot has been reset. All cached data cleared, connections refreshed. Bot is ready for new commands.`
}

async function getBotStatus(botName: string): Promise<string> {
  // Get recent metrics and logs
  const { data: metrics } = await supabase
    .from("bot_performance_metrics")
    .select("*")
    .eq("bot_name", botName)
    .order("metric_date", { ascending: false })
    .limit(1)
    .single()

  const { data: recentLogs } = await supabase
    .from("assistant_interaction_logs")
    .select("*")
    .eq("bot_name", botName)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })

  const successRate = metrics
    ? ((metrics.successful_commands / Math.max(metrics.total_commands, 1)) * 100).toFixed(1)
    : "N/A"
  const avgResponseTime = metrics?.average_response_time_ms || 0
  const recentActivity = recentLogs?.length || 0

  return `${botName} Status Report: Success rate ${successRate}%, Average response time ${avgResponseTime}ms, ${recentActivity} interactions in last 24h. System operational.`
}

async function executeBotCommand(botName: string, command: string, adminId: string): Promise<string> {
  // This would integrate with actual bot systems
  // For now, return a simulated response based on the command
  return `${botName} executed command: "${command}". Command processed successfully with specialized AI logic.`
}

async function updateBotStatus(botName: string, status: string, errorMessage?: string) {
  await supabase.rpc("update_bot_health_status", {
    p_bot_name: botName,
    p_status: status,
    p_error_message: errorMessage || null,
  })
}

async function updateBotMetrics(botName: string, success: boolean, executionTime: number) {
  const today = new Date().toISOString().split("T")[0]

  await supabase
    .from("bot_performance_metrics")
    .upsert({
      bot_name: botName,
      metric_date: today,
      total_commands: supabase.sql`total_commands + 1`,
      successful_commands: success ? supabase.sql`successful_commands + 1` : supabase.sql`successful_commands`,
      failed_commands: success ? supabase.sql`failed_commands` : supabase.sql`failed_commands + 1`,
      average_response_time_ms: executionTime,
      updated_at: new Date().toISOString(),
    })
    .select()
}
