import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env.server"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || "", env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching reminders:", error)
      return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
    }

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, recipientName, recipientEmail, date, title, type, priorityLevel, notes } = body

    if (!userId || !recipientName || !title || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: reminder, error } = await supabase
      .from("reminders")
      .insert({
        user_id: userId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        date,
        title,
        type,
        priority_level: priorityLevel,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating reminder:", error)
      return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reminderId, updates } = body

    if (!reminderId) {
      return NextResponse.json({ error: "Reminder ID required" }, { status: 400 })
    }

    const { data: reminder, error } = await supabase
      .from("reminders")
      .update(updates)
      .eq("id", reminderId)
      .select()
      .single()

    if (error) {
      console.error("Error updating reminder:", error)
      return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 })
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
