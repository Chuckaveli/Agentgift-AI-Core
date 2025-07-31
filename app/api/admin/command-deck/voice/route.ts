import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, audioData, textInput, sessionId, adminId } = body

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
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

    const response: any = { success: true }

    switch (action) {
      case "speech_to_text":
        // For demo purposes, simulate speech recognition
        const demoTranscripts = [
          "Summon Tokenomics Bot",
          "Status report for all bots",
          "Activate Emotional Engine Bot",
          "Pause Social Media Manager",
          "Reset Game Engine Bot",
        ]
        const randomTranscript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)]

        response.transcript = randomTranscript
        response.aiResponse = `Processing command: "${randomTranscript}". Command received and executing now.`
        break

      case "text_to_speech":
        // For demo purposes, return success (browser will handle TTS)
        response.message = "Text-to-speech processed"
        response.audioData = null // Browser will use Web Speech API
        break

      case "process_command":
        const command = textInput?.toLowerCase() || ""
        let aiResponse = ""

        if (command.includes("summon") || command.includes("activate")) {
          aiResponse =
            "Command acknowledged. Summoning the requested bot now. Bot activation systems engaged and ready to process commands."
        } else if (command.includes("status")) {
          aiResponse =
            "Accessing Command Deck status… All AI Council members are monitored. Systems are operational and ready for commands."
        } else if (command.includes("pause") || command.includes("stop")) {
          aiResponse = "Command acknowledged. Pausing the requested bot. All active processes will be suspended."
        } else {
          aiResponse =
            "Hmm, I didn't quite catch that. Which bot would you like to summon or control? Available bots include Tokenomics, Emotional Engine, Gift Intel, Social Media Manager, Game Engine, Intent Detection, Voice Assistant, and Referral System."
        }

        response.aiResponse = aiResponse
        response.transcript = textInput
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Log the interaction
    try {
      await supabase.from("assistant_interaction_logs").insert({
        user_id: adminId,
        session_id: sessionId,
        action_type: action,
        command_input: textInput || "voice_command",
        response_output: response.aiResponse || response.message,
        status: "success",
        created_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.warn("Failed to log voice interaction:", logError)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing voice command:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process voice command",
        voiceMessage: "I'm sorry, I encountered an error processing your command. Please try again.",
      },
      { status: 500 },
    )
  }
}
