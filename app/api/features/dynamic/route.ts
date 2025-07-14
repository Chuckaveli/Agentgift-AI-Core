import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: features, error } = await supabase
      .from("registered_features")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ features })
  } catch (error) {
    console.error("Error fetching dynamic features:", error)
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 })
  }
}
