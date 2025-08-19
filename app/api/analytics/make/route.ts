import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    // Get Make.com webhook URL from environment
    const webhookUrl = process.env.MAKE_WEBHOOK_URL || process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL

    if (!webhookUrl) {
      console.log("Make.com webhook URL not configured")
      return NextResponse.json({ success: false, error: "Webhook URL not configured" }, { status: 400 })
    }

    // Send to Make.com webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...eventData,
        source: "agentgift_dashboard",
        environment: process.env.NODE_ENV || "development",
      }),
    })

    if (!response.ok) {
      throw new Error(`Make.com webhook failed: ${response.status} ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Make.com analytics error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
