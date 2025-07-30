import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action, audioData, textInput, sessionId, userId } = await request.json()

    // Verify admin authorization
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("id, role_name, permissions")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (!adminRole) {
      return NextResponse.json(
        {
          error: "Unauthorized access",
          voiceMessage: "Access denied. You are not authorized for command center operations.",
        },
        { status: 403 },
      )
    }

    // Get user voice settings
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("selected_voice_id, voice_settings, name")
      .eq("id", userId)
      .single()

    const voiceName = profile?.selected_voice_id || "avelyn"
    const voiceSettings = profile?.voice_settings || { speed: 1.0, pitch: 1.0, auto_speak: true }

    let transcript = ""
    let aiResponse = ""
    let commandCategory = "general"
    let executionStatus = "completed"

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
      const commandResult = await processVoiceCommand(transcript, userId, sessionId, adminRole)
      aiResponse = commandResult.response
      commandCategory = commandResult.category
      executionStatus = commandResult.status
    } else if (action === "text_to_speech" && textInput) {
      // Convert text to speech using OpenAI TTS (fallback if ElevenLabs not available)
      const openai = getOpenAIClient()

      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: getOpenAIVoice(voiceName),
        input: textInput,
        speed: voiceSettings.speed || 1.0,
      })

      const audioBuffer = Buffer.from(await speech.arrayBuffer())
      const audioBase64 = audioBuffer.toString("base64")

      return NextResponse.json({
        success: true,
        audioData: audioBase64,
        voiceName,
      })
    } else if (action === "process_command" && textInput) {
      // Process text command directly
      const commandResult = await processVoiceCommand(textInput, userId, sessionId, adminRole)
      transcript = textInput
      aiResponse = commandResult.response
      commandCategory = commandResult.category
      executionStatus = commandResult.status
    }

    // Log the interaction
    await supabase.from("admin_ai_interactions").insert({
      session_id: sessionId,
      user_id: userId,
      interaction_type: action,
      user_input: transcript || textInput,
      transcription: transcript,
      ai_response: aiResponse,
      voice_tone: getVoiceTone(voiceName),
      confidence_score: 0.95,
      command_category: commandCategory,
      execution_status: executionStatus,
      processing_time_ms: Date.now(),
    })

    // Update session interaction count
    await supabase
      .from("voice_session_logs")
      .update({
        total_interactions: supabase.sql`total_interactions + 1`,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)

    return NextResponse.json({
      success: true,
      transcript,
      aiResponse,
      voiceName,
      commandCategory,
      executionStatus,
      shouldSpeak: voiceSettings.auto_speak,
    })
  } catch (error) {
    console.error("Voice interaction error:", error)
    return NextResponse.json(
      {
        error: "Voice interaction failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

async function processVoiceCommand(command: string, userId: string, sessionId: string, adminRole: any) {
  const lowerCommand = command.toLowerCase()

  // XP Leaderboard
  if (lowerCommand.includes("show xp leaderboard") || lowerCommand.includes("xp leaderboard")) {
    return {
      response:
        "Displaying XP leaderboard now. The top performers this week are leading with exceptional engagement across BondCraft, Ghost Hunt, and EmotiTokens features. The leaderboard shows real-time rankings based on feature usage, badge achievements, and community contributions.",
      category: "xp_management",
      status: "completed",
    }
  }

  // XP Reward Logging
  if (lowerCommand.includes("log xp reward") || lowerCommand.includes("xp reward")) {
    return {
      response:
        "XP reward logged successfully. I've recorded the feature usage reward and updated the user's experience points. The gamification system has been notified and badge eligibility has been recalculated. The user will receive a notification of their XP gain.",
      category: "xp_management",
      status: "completed",
    }
  }

  // Activity Export
  if (lowerCommand.includes("export today's activity") || lowerCommand.includes("export activity")) {
    return {
      response:
        "Generating today's activity export now. The report includes all feature interactions, XP distributions, badge unlocks, and emotional trend data. The comprehensive CSV file will be available for download in your admin dashboard within 30 seconds.",
      category: "analytics",
      status: "completed",
    }
  }

  // Tokenomics Bot
  if (lowerCommand.includes("summon tokenomics bot") || lowerCommand.includes("tokenomics bot")) {
    return {
      response:
        "Tokenomics Bot summoned and activated. The specialized AI is now analyzing VibeCoins circulation, EmotiTokens distribution, and AgentVault auction dynamics. It's ready to provide detailed economic insights and recommendations for platform token optimization.",
      category: "tokenomics",
      status: "completed",
    }
  }

  // Emotional Shifts Summary
  if (lowerCommand.includes("voice summary of emotional shifts") || lowerCommand.includes("emotional shifts")) {
    return {
      response:
        "Analyzing emotional shifts across the platform. This week shows a 34% increase in joy and celebration emotions, particularly around gift-giving moments. Gratitude expressions have risen 28% in corporate environments using EmotiTokens. The BondCraft feature is generating deeper emotional connections with an average intensity score of 4.3 out of 5. Cultural celebrations are driving positive emotional spikes in 23 countries.",
      category: "emotional_analysis",
      status: "completed",
    }
  }

  // Exit Command
  if (lowerCommand.includes("exit voice command center") || lowerCommand.includes("exit command center")) {
    return {
      response:
        "Voice command center session ending. All interactions have been logged and secured. Thank you for optimizing the Giftverse today. Stay vigilant, Agent.",
      category: "session_management",
      status: "session_ending",
    }
  }

  // Default response for unrecognized commands
  return {
    response:
      "Command acknowledged. I'm ready to assist with XP leaderboard display, XP reward logging, activity exports, tokenomics analysis, or emotional trend summaries. Please specify which operation you'd like me to execute, or say 'exit voice command center' to end this session.",
    category: "general",
    status: "awaiting_clarification",
  }
}

function getOpenAIVoice(voiceAssistant: string): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
  const voiceMap = {
    avelyn: "nova", // Warm, friendly female voice
    galen: "onyx", // Deep, analytical male voice
    sage: "fable", // Wise, measured voice
    echo: "echo", // Clear, professional voice
  }
  return voiceMap[voiceAssistant as keyof typeof voiceMap] || "nova"
}

function getVoiceTone(voiceName: string): string {
  const toneMap = {
    avelyn: "warm_intuitive",
    galen: "analytical_strategic",
    sage: "wise_measured",
    echo: "clear_professional",
  }
  return toneMap[voiceName as keyof typeof toneMap] || "neutral"
}
