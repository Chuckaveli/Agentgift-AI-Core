import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export const dynamic = "force-dynamic"

const supabase = createAdminClient()

export async function GET() {
  try {
    // Mock auction status since function doesn't exist
    const mockStatus = {
      is_live: true,
      phase: "active",
      season: "2024-winter",
      time_remaining: "2 days 14 hours",
      next_auction: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json(mockStatus)
  } catch (error) {
    console.error("Status error:", error)
    return NextResponse.json({ error: "Failed to fetch auction status" }, { status: 500 })
  }
}
