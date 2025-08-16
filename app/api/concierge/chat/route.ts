import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const ORCH_URL = process.env.ORCHESTRATOR_URL
    const ORCH_KEY = process.env.ORCHESTRATOR_SIGNING_SECRET

    if (!ORCH_URL || !ORCH_KEY) {
      console.error("[concierge/chat] Missing env", { hasURL: !!ORCH_URL, hasKey: !!ORCH_KEY })
      return NextResponse.json(
        { error: "Server misconfig: orchestrator env missing" },
        { status: 500 }
      )
    }

    // Expect a minimal, stable payload from the client
    const body = await req.json().catch(() => ({}))
    const { message, persona, sessionId, profile } = body ?? {}

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid payload: message is required" },
        { status: 400 }
      )
    }

    // Call orchestrator with the “CHAT_CONCIERGE” action
    const res = await fetch(`${ORCH_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AG-Orch-Key": ORCH_KEY, // don’t expose this on client!
      },
      body: JSON.stringify({
        action: "CHAT_CONCIERGE",
        payload: {
          message,
          persona: persona ?? "avelyn",
          sessionId,
          profile: profile ?? null, // { tier, xp_level, love_language, life_path_number }
          // you can add pageContext if you want (route, referrer, etc.)
        },
      }),
      // Make timeouts fail fast; the hook will retry
      // @ts-ignore
      cache: "no-store",
    })

    const text = await res.text()
    let json: any = null
    try { json = JSON.parse(text) } catch { /* keep raw text */ }

    if (!res.ok) {
      console.error("[concierge/chat] Orchestrator error", { status: res.status, body: text })
      return NextResponse.json(
        { error: "orchestrator_failed", status: res.status, details: json ?? text },
        { status: 502 }
      )
    }

    // Expect { reply: string, meta?: {...} }
    if (!json || typeof json.reply !== "string") {
      console.error("[concierge/chat] Invalid orchestrator shape", { json })
      return NextResponse.json(
        { error: "invalid_orchestrator_response", details: json },
        { status: 502 }
      )
    }

    return NextResponse.json(json, { status: 200 })
  } catch (err: any) {
    console.error("[concierge/chat] Uncaught", err)
    return NextResponse.json({ error: "server_crash", message: String(err?.message || err) }, { status: 500 })
  }
}
