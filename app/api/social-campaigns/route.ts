import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-key",
)

export async function GET(request: NextRequest) {
  try {
    const { data: campaigns, error } = await supabase
      .from("social_campaigns")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching campaigns:", error)
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error in GET /api/social-campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
