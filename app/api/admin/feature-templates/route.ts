import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase environment variables not configured")
      return NextResponse.json({
        templates: [],
        message: "Database not configured",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: templates, error } = await supabase
      .from("feature_templates")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({
        templates: [],
        error: "Database query failed",
      })
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      {
        templates: [],
        error: "Failed to fetch templates",
      },
      { status: 500 },
    )
  }
}
