import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/clients"

const DEFAULT_HISTORY = [
  {
    id: "1",
    command: "Activate Emotional Engine Bot",
    type: "voice",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    result: "Bot activated successfully",
    user_id: "admin",
  },
  {
    id: "2",
    command: "Status update for Tokenomics Bot",
    type: "text",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    result: "Bot is running optimally - 98.5% success rate",
    user_id: "admin",
  },
  {
    id: "3",
    command: "Reset Game Engine Bot",
    type: "voice",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    result: "Bot reset completed, entering maintenance mode",
    user_id: "admin",
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data: history, error } = await supabase
      .from("command_history")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(5)

    if (error) {
      console.log("Database not ready, using default history:", error.message)
      return NextResponse.json({ history: DEFAULT_HISTORY })
    }

    return NextResponse.json({ history: history || DEFAULT_HISTORY })
  } catch (error) {
    console.log("Using fallback history:", error)
    return NextResponse.json({ history: DEFAULT_HISTORY })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { command, type, result } = await request.json()
    const supabase = createAdminClient()

    const { error } = await supabase.from("command_history").insert({
      command,
      type,
      result,
      user_id: "admin",
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.log("Could not save command history:", error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
