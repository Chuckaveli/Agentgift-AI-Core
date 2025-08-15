import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID required",
          voiceMessage: "Access denied. User identification required for command center entry.",
        },
        { status: 400 },
      )
    }

    // Verify admin status
    const { data: adminRole, error: adminError } = await supabase
      .from("admin_roles")
      .select("id, role_name, permissions, is_active, expires_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (adminError || !adminRole) {
      // Log unauthorized access attempt
      await supabase.from("admin_ai_interactions").insert({
        session_id: sessionId || `unauthorized_${Date.now()}`,
        user_id: userId,
        interaction_type: "access_denied",
        user_input: "Attempted admin access",
        ai_response: "Access denied. You are not authorized for command center entry.",
        execution_status: "blocked",
        processing_time_ms: Date.now(),
      })

      return NextResponse.json(
        {
          authorized: false,
          error: "Access denied",
          voiceMessage:
            "Access denied. You are not authorized for command center entry. Please contact your system administrator if you believe this is an error.",
        },
        { status: 403 },
      )
    }

    // Check if role has expired
    if (adminRole.expires_at && new Date(adminRole.expires_at) < new Date()) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Access expired",
          voiceMessage:
            "Access denied. Your administrative privileges have expired. Please contact your system administrator for renewal.",
        },
        { status: 403 },
      )
    }

    // Get user profile and voice settings
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("name, selected_voice_id, voice_settings")
      .eq("id", userId)
      .single()

    const voiceName = profile?.selected_voice_id || "avelyn"
    const userName = profile?.name || "Agent"

    // Create welcome message based on voice personality
    const welcomeMessages = {
      avelyn: `Hello ${userName}. Voice link verified. Command center activated. I'm Avelyn, your warm and intuitive guide. What shall we optimize today?`,
      galen: `Greetings ${userName}. Authentication confirmed. Command center online. I am Galen, your analytical strategist. How may I assist with platform intelligence today?`,
      sage: `Welcome ${userName}. Access granted to command center. I am Sage, your wise counsel. What strategic insights do you seek today?`,
      echo: `Hello ${userName}. Voice authentication successful. Command center ready. I'm Echo, your clear and precise assistant. What operations shall we execute today?`,
    }

    const welcomeMessage = welcomeMessages[voiceName as keyof typeof welcomeMessages] || welcomeMessages.avelyn

    // Create voice session log
    const { data: sessionLog } = await supabase
      .from("voice_session_logs")
      .insert({
        user_id: userId,
        session_id: sessionId,
        voice_name: voiceName,
        greeting_message: welcomeMessage,
        session_status: "active",
      })
      .select()
      .single()

    // Log successful authentication
    await supabase.from("admin_ai_interactions").insert({
      session_id: sessionId,
      user_id: userId,
      interaction_type: "authentication_success",
      user_input: "Admin access request",
      ai_response: welcomeMessage,
      command_category: "authentication",
      execution_status: "completed",
      processing_time_ms: Date.now(),
    })

    return NextResponse.json({
      authorized: true,
      adminRole: adminRole.role_name,
      permissions: adminRole.permissions,
      voiceName,
      voiceSettings: profile?.voice_settings || { speed: 1.0, pitch: 1.0, auto_speak: true },
      welcomeMessage,
      sessionId: sessionLog?.id || sessionId,
      userName,
    })
  } catch (error) {
    console.error("Voice Guardian auth error:", error)
    return NextResponse.json(
      {
        error: "Authentication system error",
        voiceMessage: "Command center authentication system is currently unavailable. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const userId = searchParams.get("userId")

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "Session ID and User ID required" }, { status: 400 })
    }

    // End voice session
    await supabase
      .from("voice_session_logs")
      .update({
        session_status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("user_id", userId)

    // Log session end
    await supabase.from("admin_ai_interactions").insert({
      session_id: sessionId,
      user_id: userId,
      interaction_type: "session_end",
      user_input: "Exit voice command center",
      ai_response: "Voice command center session ended. Thank you for using the Giftverse Leader Dashboard.",
      command_category: "session_management",
      execution_status: "completed",
      processing_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      message: "Session ended successfully",
      voiceMessage:
        "Voice command center session ended. Thank you for using the Giftverse Leader Dashboard. Stay secure, Agent.",
    })
  } catch (error) {
    console.error("Session end error:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
