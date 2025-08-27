import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import { withAdmin } from '@/lib/with-admin';

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function __orig_GET(request: NextRequest) {
  try {
    const { data: participants, error } = await supabase
      .from("great_samaritan_participants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching participants:", error)
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    return NextResponse.json({ participants })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function __orig_POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, department, nomination_reason } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const { data: participant, error } = await supabase
      .from("great_samaritan_participants")
      .insert([
        {
          name,
          email,
          department,
          nomination_reason,
          status: "active",
          points: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating participant:", error)
      return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
    }

    return NextResponse.json({ participant }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const __orig_GET = withAdmin(__orig_GET);
export const GET = withAdmin(__orig_GET);
const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
