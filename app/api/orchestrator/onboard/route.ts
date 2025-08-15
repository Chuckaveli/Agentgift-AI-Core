import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/clients"
import { verify } from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()

    // Get authenticated user
    const supabase = getServerClient() => cookieStore })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 })
    }

    // Use server client for admin operations
    const serverSupabase = getServerClient()

    // Start transaction-like operations
    let isNewUser = false
    let demoData = null

    // 1. Check/Create user profile
    const { data: existingProfile } = await serverSupabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!existingProfile) {
      // Create new user profile
      const { error: profileError } = await serverSupabase.from("user_profiles").insert({
        user_id: user.id,
        tier: ["FREE"],
        level: 1,
        current_xp: 50, // Bonus XP for new users
        lifetime_xp: 50,
        demo_completed: false,
        onboarding_completed: true,
        signup_source: "demo",
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw new Error("Failed to create user profile")
      }

      // Award onboarding XP
      const { error: xpError } = await serverSupabase.from("xp_transactions").insert({
        user_id: user.id,
        reason: "Welcome bonus - First signup",
        amount: 50,
      })

      if (xpError) {
        console.error("XP transaction error:", xpError)
      }

      isNewUser = true
    }

    // 2. Process demo token if present
    const demoToken = cookieStore.get("demo_token")?.value

    if (demoToken) {
      try {
        const decoded = verify(demoToken, process.env.ORCHESTRATOR_SIGNING_SECRET!) as any

        // Get demo session
        const { data: demoSession, error: demoError } = await serverSupabase
          .from("demo_sessions")
          .select("*")
          .eq("id", decoded.demoSessionId)
          .eq("consumed", false)
          .single()

        if (demoSession && !demoError) {
          const payload = demoSession.payload

          // Create recipient
          const { data: recipient, error: recipientError } = await serverSupabase
            .from("recipients")
            .insert({
              user_id: user.id,
              name: payload.recipient,
              interests: payload.interests,
            })
            .select()
            .single()

          if (!recipientError && recipient) {
            // Create gift suggestions
            const giftSuggestions = payload.outputs.map((output: any) => ({
              user_id: user.id,
              recipient_id: recipient.id,
              kind: output.type,
              text: output.text,
              rationale: output.rationale,
              source: "demo",
            }))

            const { error: suggestionsError } = await serverSupabase.from("gift_suggestions").insert(giftSuggestions)

            if (!suggestionsError) {
              // Mark demo as consumed and attach to user
              await serverSupabase
                .from("demo_sessions")
                .update({
                  user_id: user.id,
                  consumed: true,
                })
                .eq("id", demoSession.id)

              // Update user profile to mark demo as completed
              await serverSupabase.from("user_profiles").update({ demo_completed: true }).eq("user_id", user.id)

              demoData = {
                recipient: recipient.name,
                suggestions: payload.outputs,
              }
            }
          }
        }
      } catch (tokenError) {
        console.error("Demo token processing error:", tokenError)
      }
    }

    // Log successful onboarding
    await logToWebhook("user-onboarded", {
      userId: user.id,
      email: user.email,
      isNewUser,
      hasDemoData: !!demoData,
      timestamp: new Date().toISOString(),
    })

    // Clear demo token cookie
    const response = NextResponse.json({
      ok: true,
      next: "/dashboard",
      isNewUser,
      demoData,
    })

    response.cookies.delete("demo_token")

    return response
  } catch (error) {
    console.error("Onboarding error:", error)

    await logToWebhook("onboarding-error", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ ok: false, error: "Onboarding failed" }, { status: 500 })
  }
}

async function logToWebhook(event: string, data: any) {
  try {
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          source: "orchestrator",
        }),
      })
    }
  } catch (error) {
    console.error("Webhook logging failed:", error)
  }
}
