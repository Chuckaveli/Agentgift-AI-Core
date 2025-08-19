import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/clients"
=======
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"
>>>>>>> origin/main

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const { email, name, gift_context, source = "landing_page" } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Store the lead in the database
    const { data, error } = await supabase
      .from("gift_entry_leads")
      .insert({
        email,
        name,
        gift_context,
        source,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 })
    }

    // Send welcome email or trigger automation here
    // await sendWelcomeEmail(email, name)

    return NextResponse.json({
      success: true,
      lead_id: data.id,
      message: "Lead captured successfully",
    })
  } catch (error) {
    console.error("Gift entry leads API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data: leads, error } = await supabase
      .from("gift_entry_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    }

    return NextResponse.json({
      leads: leads || [],
      total: leads?.length || 0,
    })
  } catch (error) {
    console.error("Gift entry leads API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
