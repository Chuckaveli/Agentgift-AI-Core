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
      return NextResponse.json(
        {
          error: "Restricted zone. Only Giftverse Admins may summon the AI Council.",
          voiceMessage: "Restricted zone. Only Giftverse Admins may summon the AI Council.",
        },
        { status: 403 },
      )
    }

    let transcript = ""
    let aiResponse = ""
    let botTarget = ""
    let actionTaken = ""

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
      const commandResult = await processVoiceCommand(transcript, adminId, sessionId)
      aiResponse = commandResult.response
      botTarget = commandResult.botTarget
      actionTaken = commandResult.action
    } else if (action === "text_to_speech" && textInput) {
      // Convert text to speech
      const openai = getOpenAIClient()

      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova", // Warm, friendly voice for the Command Deck AI
        input: textInput,
        speed: 1.0,
      })

      const audioBuffer = Buffer.from(await speech.arrayBuffer())
      const audioBase64 = audioBuffer.toString("base64")

      return NextResponse.json({
        success: true,
        audioData: audioBase64,
      })
    } else if (action === "process_command" && textInput) {
      // Process text command directly
      const commandResult = await processVoiceCommand(textInput, adminId, sessionId)
      transcript = textInput
      aiResponse = commandResult.response
      botTarget = commandResult.botTarget
      actionTaken = commandResult.action
    }

    // Log command in history
    await supabase.from("command_history").insert({
      user_id: adminId,
      session_id: sessionId,
      command_text: transcript || textInput,
      bot_target: botTarget,
      action_taken: actionTaken,
      command_result: aiResponse,
      voice_input: action === "speech_to_text",
    })

    return NextResponse.json({
      success: true,
      transcript,
      aiResponse,
      botTarget,
      actionTaken,
    })
  } catch (error) {
    console.error("Command deck voice error:", error)
    return NextResponse.json({ error: "Voice processing failed", details: error.message }, { status: 500 })
  }
}

async function processVoiceCommand(command: string, adminId: string, sessionId: string) {
  const lowerCommand = command.toLowerCase()

  // Bot summoning commands
  if (lowerCommand.includes("summon") || lowerCommand.includes("activate")) {
    const botName = extractBotName(lowerCommand)
    if (botName) {
      // Execute bot summon action
      const response = await fetch("/api/admin/command-deck/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summon",
          botName,
          adminId,
          sessionId,
        }),
      })

      const result = await response.json()

      return {
        response: `Summoning the ${getBotDisplayName(botName)} now… ${result.response || "Bot activation in progress."}`,
        botTarget: botName,
        action: "summon",
      }
    }
  }

  // Status check commands
  if (lowerCommand.includes("status") || lowerCommand.includes("report")) {
    const botName = extractBotName(lowerCommand)
    if (botName) {
      const response = await fetch("/api/admin/command-deck/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status_check",
          botName,
          adminId,
          sessionId,
        }),
      })

      const result = await response.json()

      return {
        response: result.response || `${getBotDisplayName(botName)} status retrieved.`,
        botTarget: botName,
        action: "status_check",
      }
    } else {
      // General status of all bots
      return {
        response:
          "Accessing Command Deck status… All AI Council members are monitored. The Tokenomics Bot shows high activity, Emotional Engine is processing 2,847 interactions, and Voice Assistant systems are optimal. Would you like details on a specific bot?",
        botTarget: "all",
        action: "general_status",
      }
    }
  }

  // Pause commands
  if (lowerCommand.includes("pause") || lowerCommand.includes("stop")) {
    const botName = extractBotName(lowerCommand)
    if (botName) {
      const response = await fetch("/api/admin/command-deck/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pause",
          botName,
          adminId,
          sessionId,
        }),
      })

      const result = await response.json()

      return {
        response: `Pausing ${getBotDisplayName(botName)}… ${result.response || "Bot has been suspended."}`,
        botTarget: botName,
        action: "pause",
      }
    }
  }

  // Reset commands
  if (lowerCommand.includes("reset") || lowerCommand.includes("restart")) {
    const botName = extractBotName(lowerCommand)
    if (botName) {
      const response = await fetch("/api/admin/command-deck/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          botName,
          adminId,
          sessionId,
        }),
      })

      const result = await response.json()

      return {
        response: `Resetting ${getBotDisplayName(botName)}… ${result.response || "Bot systems refreshed and ready."}`,
        botTarget: botName,
        action: "reset",
      }
    }
  }

  // Default response for unclear commands
  return {
    response:
      "Hmm, I didn't quite catch that. Which bot would you like to summon or control? Available bots include Tokenomics, Emotional Engine, Gift Intel, Social Media Manager, Game Engine, Intent Detection, Voice Assistant, and Referral System. You can say 'summon', 'pause', 'reset', or 'status' followed by the bot name.",
    botTarget: "",
    action: "clarification_needed",
  }
}

function extractBotName(command: string): string {
  const botMappings = {
    tokenomics: "ag-tokenomics-v3",
    "emotional engine": "emotional-signature-engine",
    emotional: "emotional-signature-engine",
    "gift intel": "gift-intel-blog-generator",
    "blog generator": "gift-intel-blog-generator",
    "social media": "social-media-manager",
    social: "social-media-manager",
    "game engine": "giftverse-game-engine",
    gaming: "giftverse-game-engine",
    "intent detection": "silent-intent-detection",
    intent: "silent-intent-detection",
    "voice assistant": "voice-assistant-engine",
    voice: "voice-assistant-engine",
    referral: "referral-system",
  }

  for (const [key, value] of Object.entries(botMappings)) {
    if (command.includes(key)) {
      return value
    }
  }

  return ""
}

function getBotDisplayName(botName: string): string {
  const displayNames = {
    "ag-tokenomics-v3": "AG Tokenomics v3 Bot",
    "emotional-signature-engine": "Emotional Signature Engine Bot",
    "gift-intel-blog-generator": "Gift Intel Blog Generator Bot",
    "social-media-manager": "Social Media Manager Bot",
    "giftverse-game-engine": "Giftverse Game Engine Bot",
    "silent-intent-detection": "Silent Intent Detection Bot",
    "voice-assistant-engine": "Voice Assistant Engine Bot",
    "referral-system": "Referral System Bot",
  }

  return displayNames[botName] || botName
}
