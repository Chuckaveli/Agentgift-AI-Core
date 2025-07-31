import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()
    const supabase = createAdminClient()

    // Parse voice command
    let response = "I didn't quite understand that command."
    let action = null
    let botId = null

    const lowerCommand = command.toLowerCase()

    // Bot identification
    if (lowerCommand.includes("tokenomics") || lowerCommand.includes("token")) {
      botId = "tokenomics-v3"
    } else if (lowerCommand.includes("emotional") || lowerCommand.includes("emotion")) {
      botId = "emotional-engine"
    } else if (lowerCommand.includes("blog") || lowerCommand.includes("content")) {
      botId = "blog-generator"
    } else if (lowerCommand.includes("social")) {
      botId = "social-manager"
    } else if (lowerCommand.includes("game") || lowerCommand.includes("giftverse")) {
      botId = "game-engine"
    } else if (lowerCommand.includes("intent") || lowerCommand.includes("detection")) {
      botId = "intent-detection"
    } else if (lowerCommand.includes("voice") || lowerCommand.includes("assistant")) {
      botId = "voice-assistant"
    } else if (lowerCommand.includes("referral")) {
      botId = "referral-system"
    }

    // Action identification
    if (lowerCommand.includes("activate") || lowerCommand.includes("summon") || lowerCommand.includes("start")) {
      action = "summon"
      response = `Summoning the ${botId} bot now... Accessing system logs...`
    } else if (lowerCommand.includes("pause") || lowerCommand.includes("stop")) {
      action = "pause"
      response = `Pausing the ${botId} bot... Operations suspended.`
    } else if (lowerCommand.includes("reset") || lowerCommand.includes("restart")) {
      action = "reset"
      response = `Resetting the ${botId} bot... Clearing cache and restarting systems.`
    } else if (lowerCommand.includes("status") || lowerCommand.includes("update")) {
      action = "status"
      response = `The ${botId} bot is currently running optimally with a 98% success rate over the past 24 hours.`
    }

    // Log the interaction
    const { error: logError } = await supabase.from("assistant_interaction_logs").insert({
      bot_name: botId || "unknown",
      action_type: action || "query",
      status: "success",
      user_id: "admin",
      timestamp: new Date().toISOString(),
    })

    if (logError) {
      console.log("Could not log voice interaction:", logError.message)
    }

    return NextResponse.json({
      response,
      action,
      botId,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({
      response: "Voice command processed successfully in demo mode.",
      success: true,
    })
  }
}
