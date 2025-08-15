import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-key",
)

export async function GET() {
  try {
    // Try to fetch from database, fallback to mock data if table doesn't exist or column missing
    const { data: features, error } = await supabase
      .from("registered_features")
      .select("*")
      .order("created_at", { ascending: false })

    if (error && (error.code === "42P01" || error.code === "42703")) {
      // Table doesn't exist or column missing, return mock data
      const mockFeatures = [
        {
          id: "pride-alliance",
          slug: "pride-alliance",
          name: "GiftVerse Pride Alliance™",
          description: "Inclusive emotional gifting with identity-aware suggestions",
          credit_cost: 2,
          xp_award: 50,
          tier_access: ["premium_spy", "pro_agent"],
          ui_type: "tile",
          is_active: true,
          show_locked_preview: true,
          show_on_homepage: true,
          hide_from_free_tier: false,
        },
        {
          id: "gift-gut-check",
          slug: "gift-gut-check",
          name: "Gift Gut Check",
          description: "AI-powered gift validation and improvement suggestions",
          credit_cost: 1,
          xp_award: 25,
          tier_access: ["free_agent", "premium_spy"],
          ui_type: "modal",
          is_active: true,
          show_locked_preview: true,
          show_on_homepage: true,
          hide_from_free_tier: false,
        },
      ]

      return NextResponse.json({ features: mockFeatures })
    }

    if (error) throw error

    return NextResponse.json({ features: features || [] })
  } catch (error) {
    console.error("Error fetching dynamic features:", error)
    return NextResponse.json({ features: [] })
  }
}
