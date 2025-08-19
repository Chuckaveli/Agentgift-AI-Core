import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("reports").select("*")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    console.error("Server error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
