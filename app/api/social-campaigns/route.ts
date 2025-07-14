import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-key",
)

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database, fallback to mock data if table doesn't exist
    const { data: campaigns, error } = await supabase
      .from("social_campaigns")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error && error.code === "42P01") {
      // Table doesn't exist, return mock data
      const mockCampaigns = [
        {
          id: "pride-month-2024",
          name: "Pride Month 2024",
          description: "Celebrate identity and love with enhanced rewards",
          required_hashtags: ["#AgentGifted", "#PrideMonth2024"],
          optional_hashtags: ["#LoveIsLove", "#PrideAlways"],
          xp_reward: 75,
          badge_reward: "Pride Champion",
          min_posts_for_badge: 3,
          is_active: true,
        },
        {
          id: "gift-reveal-challenge",
          name: "Gift Reveal Challenge",
          description: "Share your perfect gift moments",
          required_hashtags: ["#AgentGifted", "#GiftRevealChallenge"],
          optional_hashtags: ["#PerfectGift", "#GiftingMagic"],
          xp_reward: 50,
          badge_reward: "Gift Revealer",
          min_posts_for_badge: 5,
          is_active: true,
        },
      ]

      return NextResponse.json({ campaigns: mockCampaigns })
    }

    if (error) {
      console.error("Error fetching campaigns:", error)
      return NextResponse.json({ campaigns: [] })
    }

    return NextResponse.json({ campaigns: campaigns || [] })
  } catch (error) {
    console.error("Error in GET /api/social-campaigns:", error)
    return NextResponse.json({ campaigns: [] })
  }
}
