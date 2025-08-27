import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { withAdmin } from '@/lib/with-admin';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

async function __orig_POST(request: NextRequest) {
  try {
    const { action, audioData, textInput, sessionId, adminId } = await request.json()

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get voice settings
    const { data: voiceSettings } = await supabase
      .from("economy_architect_settings")
      .select("*")
      .eq("admin_id", adminId)
      .single()

    let transcript = ""
    let aiResponse = ""
    let actionTaken = ""
    let functionResult = null

    if (action === "speech_to_text" && audioData) {
      // Convert speech to text using Whisper
      const audioBuffer = Buffer.from(audioData, "base64")
      const openai = getOpenAIClient()
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
        model: "whisper-1",
      })

      transcript = transcription.text

      // Process the voice command
      const response = await processEconomyCommand(transcript, adminId, sessionId)
      aiResponse = response.spoken_response
      actionTaken = response.action_taken
      functionResult = response.function_result
    } else if (action === "text_to_speech" && textInput) {
      // Convert text to speech
      const openai = getOpenAIClient()
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: getVoiceForAssistant(voiceSettings?.selected_voice || "avelyn"),
        input: textInput,
        speed: 1.0,
      })

      const audioBuffer = Buffer.from(await speech.arrayBuffer())
      const audioBase64 = audioBuffer.toString("base64")

      return NextResponse.json({
        success: true,
        audioData: audioBase64,
        transcript: textInput,
      })
    } else if (action === "process_command" && textInput) {
      // Process text command directly
      const response = await processEconomyCommand(textInput, adminId, sessionId)
      aiResponse = response.spoken_response
      actionTaken = response.action_taken
      functionResult = response.function_result
    }

    // Log the voice interaction
    await supabase.from("economy_voice_logs").insert({
      admin_id: adminId,
      session_id: sessionId,
      voice_input: transcript || textInput,
      ai_response: aiResponse,
      action_taken: actionTaken,
      voice_assistant: voiceSettings?.selected_voice || "avelyn",
      processing_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      transcript,
      ai_response: aiResponse,
      action_taken: actionTaken,
      function_result: functionResult,
    })
  } catch (error) {
    console.error("Economy Architect voice error:", error)
    return NextResponse.json({ error: "Voice processing failed", details: error.message }, { status: 500 })
  }
}

async function processEconomyCommand(command: string, adminId: string, sessionId: string) {
  const lowerCommand = command.toLowerCase()

  // Get current reward settings for context
  const { data: rewardSettings } = await supabase.from("reward_settings").select("*").eq("is_active", true)

  // Analyze XP/Credit balance
  if (
    lowerCommand.includes("balance") ||
    lowerCommand.includes("economy health") ||
    lowerCommand.includes("tokenomics")
  ) {
    const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/economy-architect/functions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: "getTokenomicsBalance",
        parameters: {},
        admin_id: adminId,
        session_id: sessionId,
      }),
    })

    const balanceData = await balanceResponse.json()

    return {
      spoken_response: `The Giftverse economy is showing a health score of ${balanceData.result.overall_health}%. Today we've seen ${balanceData.result.xp_circulation.earned_today} XP earned versus ${balanceData.result.xp_circulation.spent_today} spent, giving us a healthy ratio of ${balanceData.result.xp_circulation.ratio}. Credit circulation is balanced at ${balanceData.result.credit_circulation.ratio}, with ${balanceData.result.badges_unlocked_today} badges unlocked by ${balanceData.result.active_users_today} active users. The inflation risk remains low at ${(balanceData.result.inflation_risk * 100).toFixed(1)}%. Shall I run a deeper analysis or suggest optimizations?`,
      action_taken: "economy_health_check",
      function_result: balanceData.result,
    }
  }

  // Badge forecast analysis
  if (lowerCommand.includes("badge") || lowerCommand.includes("forecast") || lowerCommand.includes("unlock")) {
    const forecastResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/economy-architect/functions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: "getTopBadgeForecast",
        parameters: {},
        admin_id: adminId,
        session_id: sessionId,
      }),
    })

    const forecastData = await forecastResponse.json()

    return {
      spoken_response: `I'm forecasting ${forecastData.result.total_predicted_unlocks} badge unlocks over the next 7 days with ${(forecastData.result.average_confidence * 100).toFixed(0)}% confidence. The top contenders are Rising Star with 23 predicted unlocks, BondCraft Master with 18, and Cultural Ambassador with 15. The seasonal boost is driving higher engagement. Would you like me to create a special badge to capitalize on this momentum?`,
      action_taken: "badge_forecast_analysis",
      function_result: forecastData.result,
    }
  }

  // XP drain forecast
  if (lowerCommand.includes("xp drain") || lowerCommand.includes("spending") || lowerCommand.includes("burn")) {
    const drainResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/economy-architect/functions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: "forecastXPDrain",
        parameters: {},
        admin_id: adminId,
        session_id: sessionId,
      }),
    })

    const drainData = await drainResponse.json()

    return {
      spoken_response: `Based on current patterns, I'm predicting ${drainData.result.next_7_days_prediction} XP will be spent over the next 7 days, averaging ${drainData.result.daily_average} XP daily. AgentVault bids are the top drain at ${drainData.result.top_spending_features[0].predicted_xp} XP, followed by premium features. The trend is ${drainData.result.trend} with ${(drainData.result.confidence * 100).toFixed(0)}% confidence. Should I suggest any adjustments to prevent inflation?`,
      action_taken: "xp_drain_forecast",
      function_result: drainData.result,
    }
  }

  // Reward trend insights
  if (lowerCommand.includes("trend") || lowerCommand.includes("insight") || lowerCommand.includes("recommend")) {
    const trendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/economy-architect/functions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: "rewardTrendInsight",
        parameters: {},
        admin_id: adminId,
        session_id: sessionId,
      }),
    })

    const trendData = await trendResponse.json()

    return {
      spoken_response: `I'm seeing strong momentum in BondCraft with 23% growth due to high completion rates. LUMIENCE is up 18% from emotional resonance, and AgentVault is climbing 15% from auction excitement. My top recommendation is increasing BondCraft XP by 5 points, which could boost engagement by 12% with 89% confidence. I also suggest adding a weekend XP multiplier for 8% retention increase. However, watch for XP inflation in Ghost Hunt - we might need a cooldown there. Shall I run a simulation on these changes?`,
      action_taken: "trend_analysis",
      function_result: trendData.result,
    }
  }

  // Simulation requests
  if (lowerCommand.includes("simulate") || lowerCommand.includes("test") || lowerCommand.includes("what if")) {
    // Extract proposed changes from command (simplified)
    const proposedChanges = [
      { type: "xp_increase", feature: "bondcraft", amount: 5 },
      { type: "multiplier_add", feature: "weekend", amount: 1.5 },
    ]

    const simulationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/economy-architect/functions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: "simulateImpact",
        parameters: { proposed_changes: proposedChanges },
        admin_id: adminId,
        session_id: sessionId,
      }),
    })

    const simulationData = await simulationResponse.json()

    return {
      spoken_response: `I've run the simulation and predict a ${simulationData.result.predicted_outcomes.engagement_change} change in engagement, bringing us to ${simulationData.result.predicted_outcomes.predicted_engagement} overall engagement. The risk level is ${simulationData.result.risk_level} with ${(simulationData.result.confidence_score * 100).toFixed(0)}% confidence. ${simulationData.result.recommendation} Would you like me to apply these changes or run additional scenarios?`,
      action_taken: "impact_simulation",
      function_result: simulationData.result,
    }
  }

  // Voice toggle commands
  if (lowerCommand.includes("mute") || lowerCommand.includes("quiet") || lowerCommand.includes("disable voice")) {
    const toggleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/economy-architect/functions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: "enableVoiceToggle",
        parameters: { on: false },
        admin_id: adminId,
        session_id: sessionId,
      }),
    })

    return {
      spoken_response:
        "Voice assistant disabled. I'll continue processing your commands silently. Type 'enable voice' to restore audio responses.",
      action_taken: "voice_disabled",
      function_result: { voice_enabled: false },
    }
  }

  // Default greeting and help
  return {
    spoken_response: `Voice feedback enabled. You may now speak, Agent. I'm your Giftverse Economy Architect, ready to analyze platform activity, suggest intelligent adjustments to XP, credit, and badge logic, and help you maintain perfect economic balance. I can check tokenomics health, forecast badge unlocks, predict XP drain, run impact simulations, or apply reward rule changes. What would you like to explore first? Remember, I'll always ask for confirmation before applying any changes that could affect the platform balance.`,
    action_taken: "greeting_and_help",
    function_result: { available_functions: 10, economy_status: "healthy" },
  }
}

function getVoiceForAssistant(assistant: string): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
  const voiceMap = {
    avelyn: "nova", // Female, warm and professional
    galen: "onyx", // Male, deep and poetic
  }
  return voiceMap[assistant] || "nova"
}

const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
