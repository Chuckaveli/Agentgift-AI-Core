import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error retrieving session:", error)
      throw error
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { receiver_email, token_type, message } = body

    // Validate required fields
    if (!receiver_email || !token_type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate message length
    if (message.length < 5 || message.length > 200) {
      return NextResponse.json({ error: "Message must be between 5 and 200 characters" }, { status: 400 })
    }

    // Check if user has employee access
    const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", session.user.id).single()

    if (!profile || !["premium_spy", "pro_agent", "agent_00g", "admin", "super_admin"].includes(profile.tier)) {
      return NextResponse.json({ error: "Employee access required" }, { status: 403 })
    }

    // Find receiver by email
    const { data: receiver, error: receiverError } = await supabase
      .from("user_profiles")
      .select("id, email, tier")
      .eq("email", receiver_email)
      .single()

    if (receiverError || !receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Check if receiver has employee access
    if (!["premium_spy", "pro_agent", "agent_00g", "admin", "super_admin"].includes(receiver.tier)) {
      return NextResponse.json({ error: "Receiver must be an employee" }, { status: 400 })
    }

    // Prevent self-sending
    if (session.user.id === receiver.id) {
      return NextResponse.json({ error: "Nice try, but emotional inflation is real." }, { status: 400 })
    }

    // Initialize tokens for both users
    const currentMonth = new Date().toISOString().slice(0, 7)
    await supabase.rpc("initialize_monthly_tokens", {
      user_uuid: session.user.id,
      target_month: currentMonth,
    })
    await supabase.rpc("initialize_monthly_tokens", {
      user_uuid: receiver.id,
      target_month: currentMonth,
    })

    // Send the token using the database function
    const { data: result, error: sendError } = await supabase.rpc("send_emoti_token", {
      sender_uuid: session.user.id,
      receiver_uuid: receiver.id,
      token_type_name: token_type,
      message_text: message,
    })

    if (sendError) {
      console.error("Error sending token:", sendError)
      return NextResponse.json({ error: "Failed to send token" }, { status: 500 })
    }

    // Parse the result (it's returned as JSON from the function)
    const parsedResult = typeof result === "string" ? JSON.parse(result) : result

    if (!parsedResult.success) {
      return NextResponse.json({ error: parsedResult.error }, { status: 400 })
    }

    // Update leaderboard asynchronously (don't wait for it)
    supabase.rpc("update_emoti_leaderboard", { target_month: currentMonth }).then().catch(console.error)

    return NextResponse.json({
      success: true,
      message: parsedResult.message,
      xp_awarded: parsedResult.xp_awarded,
      transaction_id: parsedResult.transaction_id,
    })
  } catch (error) {
    console.error("Error in EmotiTokens send API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
