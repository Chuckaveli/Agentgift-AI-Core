import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, relationship, birthday, loveLanguage, interests, notes, timestamp } = body

    // Validate required fields
    if (!name || !relationship) {
      return NextResponse.json({ error: "Name and relationship are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Store the lead data
    const { data, error } = await supabase
      .from("gift_entry_leads")
      .insert({
        name,
        relationship,
        birthday: birthday || null,
        love_language: loveLanguage,
        interests: interests || [],
        notes: notes || "",
        created_at: timestamp || new Date().toISOString(),
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to store lead data" }, { status: 500 })
    }

    // Trigger Make.com webhook for lead processing
    try {
      await fetch(process.env.MAKE_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "gift_entry_lead",
          data: {
            id: data.id,
            name,
            relationship,
            birthday,
            love_language: loveLanguage,
            interests,
            notes,
            timestamp,
          },
        }),
      })
    } catch (webhookError) {
      console.error("Make.com webhook error:", webhookError)
      // Don't fail the request if webhook fails
    }

    return NextResponse.json({ success: true, leadId: data.id })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
