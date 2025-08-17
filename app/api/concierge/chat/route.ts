import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Forward ONLY what orchestrator expects.
    const res = await fetch(process.env.ORCHESTRATOR_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ORCHESTRATOR_SIGNING_SECRET}`,
      },
      body: JSON.stringify({
        action: "CONCIERGE_CHAT",
        payload: body, // persona, context, messages
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || "orchestrator_failed" }, { status: res.status })
    }

    // Expect { reply: string, ideas?: Idea[], meta?: {} }
    return NextResponse.json({
      reply: data.reply ?? "I have thoughts, but I need a nudge. Try rephrasing?",
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 })
  }
}
