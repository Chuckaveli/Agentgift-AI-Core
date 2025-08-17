import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Send to Make.com webhook if configured
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL

    if (makeWebhookUrl) {
      const response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "analytics_event",
          data: payload,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.error("Make.com webhook failed:", response.status, response.statusText)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics Make error:", error)
    return NextResponse.json({ error: "Failed to send to Make.com" }, { status: 500 })
  }
}
