import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()

    // Optional: read body (keep tolerant to empty body)
    const payload = await request.json().catch(() => ({} as Record<string, unknown>))

    // Optional: get current user (won't crash if not logged in)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    return NextResponse.json(
      {
        ok: true,
        userId: user?.id ?? null,
        authError: authError?.message ?? null,
        received: payload,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("onboard POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
