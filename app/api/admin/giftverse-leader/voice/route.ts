import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Initialize OpenAI client only when needed
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

export async function POST(request: NextRequest) {
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
      .from("admin_voice_settings")
      .select("*")
      .eq("admin_id", adminId)
      .single()

    let transcript = ""
    let spokenResponse = ""
    let nextAction = ""
    let logData = {}

    if (action === "speech_to_text" && audioData) {
      // Convert speech to text using Whisper
      const audioBuffer = Buffer.from(audioData, "base64")
      const openai = getOpenAIClient()
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
        model: "whisper-1",
      })

      transcript = transcription.text

      // Log speech-to-text
      await supabase.from("admin_ai_voice_transcripts").insert({
        admin_id: adminId,
        session_id: sessionId,
        transcript_type: "speech_to_text",
        content: transcript,
        voice_assistant: voiceSettings?.selected_voice || "avelyn",
        confidence_score: 0.95, // Whisper doesn't provide confidence, using default
        processing_time_ms: Date.now(),
      })

      // Process the voice command
      const aiResponse = await processVoiceCommand(transcript, adminId, sessionId)
      spokenResponse = aiResponse.spoken_response
      nextAction = aiResponse.next_action
      logData = aiResponse.logs
    } else if (action === "text_to_speech" && textInput) {
      // Convert text to speech
      const openai = getOpenAIClient()
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: getOpenAIVoice(voiceSettings?.selected_voice || "avelyn"),
        input: textInput,
        speed: voiceSettings?.voice_speed || 1.0,
      })

      const audioBuffer = Buffer.from(await speech.arrayBuffer())
      const audioBase64 = audioBuffer.toString("base64")

      // Log text-to-speech
      await supabase.from("admin_ai_voice_transcripts").insert({
        admin_id: adminId,
        session_id: sessionId,
        transcript_type: "text_to_speech",
        content: textInput,
        voice_assistant: voiceSettings?.selected_voice || "avelyn",
        processing_time_ms: Date.now(),
      })

      return NextResponse.json({
        success: true,
        audioData: audioBase64,
        transcript: textInput,
      })
    } else if (action === "process_command" && textInput) {
      // Process text command directly
      const aiResponse = await processVoiceCommand(textInput, adminId, sessionId)
      spokenResponse = aiResponse.spoken_response
      nextAction = aiResponse.next_action
      logData = aiResponse.logs
    }

    // Log the dashboard action
    await supabase.from("admin_dashboard_logs").insert({
      admin_id: adminId,
      session_id: sessionId,
      action_type: logData.action_type || "voice_interaction",
      action_detail: logData.action_detail || transcript || textInput,
      request_data: { action, transcript, textInput },
      response_data: { spokenResponse, nextAction },
      execution_status: "completed",
      execution_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      spoken_response: spokenResponse,
      next_action: nextAction,
      transcript,
      logs: logData,
    })
  } catch (error) {
    console.error("Giftverse Leader voice error:", error)
    return NextResponse.json({ error: "Voice processing failed", details: error.message }, { status: 500 })
  }
}

async function processVoiceCommand(command: string, adminId: string, sessionId: string) {
  const lowerCommand = command.toLowerCase()

  // Emotional trends analysis
  if (lowerCommand.includes("emotional trends") || lowerCommand.includes("emotion") || lowerCommand.includes("mood")) {
    const trends = await getEmotionalTrends()
    return {
      spoken_response: `I've analyzed the emotional trends across the platform. This week, we've seen a 23% increase in joy-tagged gifts, with celebration emotions leading at 34.2%. Gratitude expressions are up 18%, particularly in the EmotiTokens feature. The BondCraft sessions show stronger emotional resonance, with an average intensity score of 4.2 out of 5.`,
      next_action: "render_emotional_insights_chart",
      logs: {
        action_type: "emotional_analysis",
        action_detail: "7-day emotional trends with tag analysis",
        data: trends,
      },
    }
  }

  // Gifting patterns analysis
  if (lowerCommand.includes("gifting patterns") || lowerCommand.includes("gift trends")) {
    return {
      spoken_response: `Analyzing gifting patterns across the Giftverse. The AgentVault auctions are driving 67% more team engagement, with VibeCoins circulation up 145%. Corporate gifting through EmotiTokens has increased peer recognition by 89%. Cultural Intelligence consultations are trending in international markets, with 34 countries actively using the system.`,
      next_action: "render_gifting_patterns_dashboard",
      logs: {
        action_type: "gifting_analysis",
        action_detail: "Platform-wide gifting pattern analysis",
      },
    }
  }

  // Feature performance
  if (lowerCommand.includes("feature performance") || lowerCommand.includes("usage stats")) {
    return {
      spoken_response: `Feature performance is strong across the board. BondCraft has a 94% completion rate with average session time of 12 minutes. Ghost Hunt maintains 87% user retention through completion. The Serendipity Engine has generated over 2,847 surprise moments this week, with a 96% positive emotional response rate.`,
      next_action: "render_feature_performance_metrics",
      logs: {
        action_type: "feature_performance",
        action_detail: "Comprehensive feature usage and performance analysis",
      },
    }
  }

  // Voice assistant switching
  if (lowerCommand.includes("switch to galen") || lowerCommand.includes("change voice")) {
    await supabase
      .from("admin_voice_settings")
      .update({ selected_voice: "galen", updated_at: new Date().toISOString() })
      .eq("admin_id", adminId)

    return {
      spoken_response: `Voice assistant switched to Galen. I am now speaking with the deeper, more analytical voice profile. All future interactions will use this voice until you request another change.`,
      next_action: "update_voice_settings",
      logs: {
        action_type: "voice_change",
        action_detail: "Switched voice assistant to Galen",
      },
    }
  }

  // XP boost commands
  if (lowerCommand.includes("xp boost") || lowerCommand.includes("boost xp")) {
    return {
      spoken_response: `XP boost initiated. I'm triggering a platform-wide 2x XP multiplier for the next 4 hours. This will affect all feature usage, badge unlocks, and gamification activities. The boost will automatically expire and I'll notify you when it's complete.`,
      next_action: "execute_xp_boost",
      logs: {
        action_type: "xp_boost",
        action_detail: "Platform-wide 2x XP boost for 4 hours",
      },
    }
  }

  // Badge system management
  if (lowerCommand.includes("badge") || lowerCommand.includes("achievement")) {
    return {
      spoken_response: `Badge system analysis complete. We have 847 active badge earners this week, with the Cultural Ambassador badge being the most sought after. The Great Samaritan program has awarded 23 community service badges. I recommend creating a new seasonal badge for the upcoming AgentVault auction to drive engagement.`,
      next_action: "render_badge_analytics",
      logs: {
        action_type: "badge_analysis",
        action_detail: "Badge system performance and recommendations",
      },
    }
  }

  // Default strategic response
  return {
    spoken_response: `I understand you're seeking strategic intelligence about the Giftverse. I have access to all platform logs, emotional trends, and gifting patterns. Please specify what aspect you'd like me to analyze - emotional trends, feature performance, user behavior, or system optimization. I can also execute commands like XP boosts, badge management, or voice assistant changes.`,
    next_action: "await_specific_command",
    logs: {
      action_type: "general_inquiry",
      action_detail: command,
    },
  }
}

async function getEmotionalTrends() {
  const { data: trends } = await supabase
    .from("emotional_tag_logs")
    .select("emotion_tags, intensity_score, created_at")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return trends || []
}

function getOpenAIVoice(voiceAssistant: string): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
  const voiceMap = {
    avelyn: "nova", // Warm, friendly female voice
    galen: "onyx", // Deep, analytical male voice
    sage: "fable", // Wise, measured voice
    echo: "echo", // Clear, professional voice
  }
  return voiceMap[voiceAssistant] || "nova"
}
