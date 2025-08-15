import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { getServerClient } from "@/lib/supabase/clients"; // <- our one true way

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = getServerClient();

    // 1) Auth: require a logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

    // 2) Ensure user profile (create if missing) + welcome XP
    let isNewUser = false;
    let demoData: null | { recipient: string; suggestions: any[] } = null;

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("user_profiles").insert({
        user_id: user.id,
        tier: ["FREE"],
        level: 1,
        current_xp: 50, // Welcome bonus
        lifetime_xp: 50,
        demo_completed: false,
        onboarding_completed: true,
        signup_source: "demo",
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Failed to create user profile");
      }

      const { error: xpError } = await supabase.from("xp_transactions").insert({
        user_id: user.id,
        reason: "Welcome bonus - First signup",
        amount: 50,
      });
      if (xpError) console.error("XP transaction error:", xpError);

      isNewUser = true;
    }

    // 3) Consume optional demo token (cookie) → seed recipient + suggestions
    const demoToken = cookieStore.get("demo_token")?.value;

    if (demoToken) {
      try {
        const decoded = verify(demoToken, process.env.ORCHESTRATOR_SIGNING_SECRET!) as any;

        // Unused/failed lookups should not block onboarding
        const { data: demoSession, error: demoError } = await supabase
          .from("demo_sessions")
          .select("*")
          .eq("id", decoded.demoSessionId)
          .eq("consumed", false)
          .single();

        if (demoSession && !demoError) {
          const payload = demoSession.payload;

          // Create recipient
          const { data: recipient, error: recipientError } = await supabase
            .from("recipients")
            .insert({
              user_id: user.id,
              name: payload.recipient,
              interests: payload.interests,
            })
            .select()
            .single();

          if (!recipientError && recipient) {
            // Seed gift suggestions
            const giftRows = (payload.outputs || []).map((o: any) => ({
              user_id: user.id,
              recipient_id: recipient.id,
              kind: o.type,
              text: o.text,
              rationale: o.rationale,
              source: "demo",
            }));

            const { error: suggestionsError } = await supabase.from("gift_suggestions").insert(giftRows);

            if (!suggestionsError) {
              // Mark demo consumed + attach to user; mark profile demo complete
              await supabase
                .from("demo_sessions")
                .update({ user_id: user.id, consumed: true })
                .eq("id", demoSession.id);

              await supabase.from("user_profiles").update({ demo_completed: true }).eq("user_id", user.id);

              demoData = {
                recipient: recipient.name,
                suggestions: payload.outputs,
              };
            }
          }
        }
      } catch (tokenError) {
        console.error("Demo token processing error:", tokenError);
      }
    }

    // 4) Log success (non-blocking)
    await logToWebhook("user-onboarded", {
      userId: user.id,
      email: user.email,
      isNewUser,
      hasDemoData: !!demoData,
      timestamp: new Date().toISOString(),
    });

    // 5) Respond + clear demo cookie
    const res = NextResponse.json({
      ok: true,
      next: "/dashboard",
      isNewUser,
      demoData,
    });

    res.cookies.delete("demo_token");
    return res;
  } catch (error) {
    console.error("Onboarding error:", error);

    await logToWebhook("onboarding-error", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: false, error: "Onboarding failed" }, { status: 500 });
  }
}

async function logToWebhook(event: string, data: any) {
  try {
    if (!process.env.MAKE_WEBHOOK_URL) return;
    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
        source: "orchestrator",
      }),
    });
  } catch (err) {
    console.error("Webhook logging failed:", err);
  }
}
