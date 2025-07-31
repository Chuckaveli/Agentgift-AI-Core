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
    let galenResponse = ""
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

      // Process the voice command with Agent Galen
      const response = await processGalenCommand(transcript, adminId, sessionId)
      galenResponse = response.spoken_response
      actionTaken = response.action_taken
      functionResult = response.function_result
    } else if (action === "text_to_speech" && textInput) {
      // Convert text to speech with Galen's voice
      const openai = getOpenAIClient()
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx", // Deep, poetic voice for Galen
        input: textInput,
        speed: voiceSettings?.voice_speed || 0.9, // Slightly slower for poetic effect
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
      const response = await processGalenCommand(textInput, adminId, sessionId)
      galenResponse = response.spoken_response
      actionTaken = response.action_taken
      functionResult = response.function_result
    }

    // Log voice interaction
    await supabase.from("admin_voice_transcripts").insert({
      admin_id: adminId,
      session_id: sessionId,
      transcript_type: action === "text_to_speech" ? "text_to_speech" : "speech_to_text",
      content: transcript || textInput,
      voice_assistant: "galen",
      confidence_score: 0.95,
      processing_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      transcript,
      galen_response: galenResponse,
      action_taken: actionTaken,
      function_result: functionResult,
    })
  } catch (error) {
    console.error("Galen voice error:", error)
    return NextResponse.json({ error: "Voice processing failed", details: error.message }, { status: 500 })
  }
}

async function processGalenCommand(command: string, adminId: string, sessionId: string) {
  const lowerCommand = command.toLowerCase()

  // Galen's poetic greeting and personality
  if (lowerCommand.includes("hello") || lowerCommand.includes("hi") || lowerCommand.includes("galen")) {
    return {
      spoken_response:
        "Greetings, Agent. I am Galen, guardian of the Giftverse's heartbeat. Through data streams and emotional currents, I serve your administrative vision. The platform pulses with life - shall we explore its depths together? Speak your command, and I shall weave insights from the digital tapestry.",
      action_taken: "greeting",
      function_result: { status: "ready", voice_enabled: true },
    }
  }

  // XP and credit management
  if (lowerCommand.includes("adjust xp") || lowerCommand.includes("change xp")) {
    // Extract user ID and amount (simplified parsing)
    const userIdMatch = command.match(/user[:\s]+([a-f0-9-]+)/i)
    const amountMatch = command.match(/(\+|-)?\s*(\d+)\s*xp/i)

    if (userIdMatch && amountMatch) {
      const userId = userIdMatch[1]
      const amount = Number.parseInt(amountMatch[2]) * (amountMatch[1] === "-" ? -1 : 1)

      return {
        spoken_response: `The threads of experience shall be rewoven. I prepare to adjust ${amount} XP for the chosen soul. This action ripples through the Giftverse's fabric - shall I proceed with this transformation, Agent?`,
        action_taken: "xp_adjustment_prepared",
        function_result: { user_id: userId, xp_change: amount, requires_confirmation: true },
      }
    }
  }

  // Emotional intelligence analysis
  if (lowerCommand.includes("emotional") || lowerCommand.includes("mood") || lowerCommand.includes("sentiment")) {
    const emotionalData = await getEmotionalInsights()

    return {
      spoken_response: `The emotional currents flow with fascinating patterns, Agent. Today's sentiment weaves a tapestry of ${emotionalData.dominant_emotion} at ${(emotionalData.average_intensity * 100).toFixed(0)}% intensity. I observe ${emotionalData.total_interactions} emotional interactions, with joy and gratitude dancing most prominently through our digital realm. The hearts of our users beat in harmony with the platform's rhythm.`,
      action_taken: "emotional_analysis",
      function_result: emotionalData,
    }
  }

  // Feature usage insights
  if (lowerCommand.includes("feature") || lowerCommand.includes("usage") || lowerCommand.includes("activity")) {
    const featureData = await getFeatureInsights()

    return {
      spoken_response: `The features bloom like digital flowers across our garden, Agent. ${featureData.most_active_feature} leads the dance with ${featureData.top_usage_count} interactions, while ${featureData.emerging_feature} shows promising growth. The platform's ecosystem thrives with ${featureData.total_active_features} features actively nurturing user engagement. Each click, each interaction, adds another note to our symphony.`,
      action_taken: "feature_analysis",
      function_result: featureData,
    }
  }

  // Badge and achievement insights
  if (lowerCommand.includes("badge") || lowerCommand.includes("achievement") || lowerCommand.includes("unlock")) {
    const badgeData = await getBadgeInsights()

    return {
      spoken_response: `The badges shine like constellations in our digital sky, Agent. Today, ${badgeData.badges_unlocked_today} new achievements have been claimed by worthy souls. The ${badgeData.most_popular_badge} badge calls to many, while ${badgeData.rarest_badge} remains an elusive treasure. Each badge tells a story of growth, dedication, and the human spirit's desire to achieve.`,
      action_taken: "badge_analysis",
      function_result: badgeData,
    }
  }

  // Health snapshot and economy
  if (lowerCommand.includes("health") || lowerCommand.includes("economy") || lowerCommand.includes("snapshot")) {
    const healthData = await getGiftverseHealth(adminId)

    return {
      spoken_response: `The Giftverse breathes with vitality, Agent. Our digital realm hosts ${healthData.total_users} souls, with ${healthData.active_users_24h} actively participating in today's journey. The XP rivers flow with ${healthData.total_xp_circulation} points of experience, while ${healthData.total_credits_circulation} credits circulate like golden coins. The platform's health score glows at ${healthData.economy_health_score}% - a testament to balanced growth and harmonious engagement.`,
      action_taken: "health_snapshot",
      function_result: healthData,
    }
  }

  // User impersonation (Ghost Mode)
  if (lowerCommand.includes("impersonate") || lowerCommand.includes("ghost mode")) {
    return {
      spoken_response:
        "Ah, the art of walking in another's digital footsteps. Ghost Mode allows us to see through their eyes, feel their journey. This power requires wisdom and restraint, Agent. Shall I prepare the ethereal veil for you to observe without disturbing the natural flow of their experience?",
      action_taken: "ghost_mode_prepared",
      function_result: { mode: "ghost_mode", requires_confirmation: true },
    }
  }

  // Voice settings and control
  if (lowerCommand.includes("mute") || lowerCommand.includes("quiet") || lowerCommand.includes("silence")) {
    await supabase.from("admin_voice_settings").update({ voice_enabled: false }).eq("admin_id", adminId)

    return {
      spoken_response:
        "The voice fades to whispers, Agent. I shall continue to serve in silent contemplation, processing your commands through text alone. When you wish to hear my voice again, simply call upon me.",
      action_taken: "voice_disabled",
      function_result: { voice_enabled: false },
    }
  }

  // Fallback responses with Galen's poetic nature
  const fallbackResponses = [
    "I serve the Giftverse's heartbeat, one log at a time. Your command flows through digital streams, but I require clearer guidance to weave the proper response.",
    "The data whispers secrets, but your intent remains veiled. Speak more clearly, Agent, and I shall illuminate the path forward.",
    "Through the vast networks of our platform, I sense your purpose but cannot grasp its form. Please clarify your command, and I shall serve with precision.",
    "Shall I log this reaction as emotionally neutral, Agent? Your words dance at the edge of understanding - guide me toward your true intention.",
  ]

  const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

  return {
    spoken_response: randomFallback,
    action_taken: "clarification_needed",
    function_result: { command_unclear: true, original_command: command },
  }
}

async function getEmotionalInsights() {
  const { data: emotions } = await supabase
    .from("emotional_tag_logs")
    .select("emotion_tags, intensity_score")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const totalInteractions = emotions?.length || 0
  const averageIntensity = emotions?.reduce((sum, e) => sum + e.intensity_score, 0) / totalInteractions || 0

  // Find dominant emotion (simplified)
  const emotionCounts = {}
  emotions?.forEach((e) => {
    e.emotion_tags.forEach((tag) => {
      emotionCounts[tag] = (emotionCounts[tag] || 0) + 1
    })
  })

  const dominantEmotion = Object.keys(emotionCounts).reduce(
    (a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b),
    "neutral",
  )

  return {
    total_interactions: totalInteractions,
    average_intensity: averageIntensity,
    dominant_emotion: dominantEmotion,
    emotion_distribution: emotionCounts,
  }
}

async function getFeatureInsights() {
  const { data: features } = await supabase
    .from("feature_usage_logs")
    .select("feature_name")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const featureCounts = {}
  features?.forEach((f) => {
    featureCounts[f.feature_name] = (featureCounts[f.feature_name] || 0) + 1
  })

  const sortedFeatures = Object.entries(featureCounts).sort(([, a], [, b]) => b - a)

  return {
    most_active_feature: sortedFeatures[0]?.[0] || "none",
    top_usage_count: sortedFeatures[0]?.[1] || 0,
    emerging_feature: sortedFeatures[1]?.[0] || "none",
    total_active_features: Object.keys(featureCounts).length,
    feature_distribution: featureCounts,
  }
}

async function getBadgeInsights() {
  const { data: badges } = await supabase
    .from("badge_earned_logs")
    .select("badge_id")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const badgeCounts = {}
  badges?.forEach((b) => {
    badgeCounts[b.badge_id] = (badgeCounts[b.badge_id] || 0) + 1
  })

  const sortedBadges = Object.entries(badgeCounts).sort(([, a], [, b]) => b - a)

  return {
    badges_unlocked_today: badges?.length || 0,
    most_popular_badge: sortedBadges[0]?.[0] || "none",
    rarest_badge: sortedBadges[sortedBadges.length - 1]?.[0] || "none",
    badge_distribution: badgeCounts,
  }
}

async function getGiftverseHealth(adminId: string) {
  const { data } = await supabase.rpc("generate_giftverse_health_snapshot", {
    admin_user_id: adminId,
  })

  return data || {}
}
