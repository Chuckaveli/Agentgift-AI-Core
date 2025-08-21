import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const rarity = searchParams.get("rarity")
    const available = searchParams.get("available")

    let query = supabase.from("agentvault_items").select("*")

    if (category) {
      query = query.eq("category", category)
    }

    if (rarity) {
      query = query.eq("rarity", rarity)
    }

    if (available === "true") {
      query = query.eq("is_available", true)
    }

    const { data: items, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching items:", error)
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, rarity, base_price, image_url, metadata } = body

    if (!name || !category || !rarity || !base_price) {
      return NextResponse.json({ error: "Name, category, rarity, and base price are required" }, { status: 400 })
    }

    const { data: item, error } = await supabase
      .from("agentvault_items")
      .insert([
        {
          name,
          description,
          category,
          rarity,
          base_price,
          current_price: base_price,
          image_url,
          metadata,
          is_available: true,
          total_bids: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating item:", error)
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
