import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const category = searchParams.get("category")

    let query = supabase.from("agentvault_rewards").select("*")

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data: rewards, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rewards:", error)
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
    }

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, reward_type, title, description, cost, category, metadata } = body

    if (!user_id || !reward_type || !title || !cost) {
      return NextResponse.json({ error: "User ID, reward type, title, and cost are required" }, { status: 400 })
    }

    const { data: reward, error } = await supabase
      .from("agentvault_rewards")
      .insert([
        {
          user_id,
          reward_type,
          title,
          description,
          cost,
          category,
          metadata,
          status: "available",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating reward:", error)
      return NextResponse.json({ error: "Failed to create reward" }, { status: 500 })
    }

    return NextResponse.json({ reward }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
