import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { webhook } = await request.json()

    // Validate webhook URL
    if (!webhook.startsWith("https://discord.com/api/webhooks/")) {
      return NextResponse.json({ error: "Invalid Discord webhook URL" }, { status: 400 })
    }

    // Save webhook to database or environment
    // For now, we'll just test the webhook
    const testMessage = {
      embeds: [
        {
          title: "🎁 AgentGift Admin Reports",
          description: "Discord webhook successfully configured!",
          color: 0xec4899,
          timestamp: new Date().toISOString(),
          footer: {
            text: "AgentGift.ai Admin Panel",
          },
        },
      ],
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMessage),
    })

    if (!response.ok) {
      throw new Error("Failed to send test message to Discord")
    }

    return NextResponse.json({ success: true, message: "Discord webhook configured successfully" })
  } catch (error) {
    console.error("Discord webhook error:", error)
    return NextResponse.json({ error: "Failed to configure Discord webhook" }, { status: 500 })
  }
}
