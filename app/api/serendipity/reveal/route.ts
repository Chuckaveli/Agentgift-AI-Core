import { type NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { occasion_type, emotional_state, recent_life_event, gift_frequency, preferred_format } = body

    // Get user profile to check tier and daily usage
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier, serendipity_used_today")
      .eq("id", session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check daily limits for free users
    if (profile.tier === "free" && profile.serendipity_used_today >= 1) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Pro for unlimited revelations." },
        { status: 429 },
      )
    }

    // Generate affirmations based on emotional state and occasion
    const affirmations = generateAffirmations(emotional_state, occasion_type)

    // Generate gift suggestion using AI logic
    const giftSuggestion = await generateGiftSuggestion({
      occasion_type,
      emotional_state,
      recent_life_event,
      gift_frequency,
      preferred_format,
    })

    // Record the revelation session
    const { data: revelation } = await supabase
      .from("serendipity_sessions")
      .insert({
        user_id: session.user.id,
        occasion_type,
        emotional_state,
        recent_life_event,
        gift_frequency,
        preferred_format,
        gift_name: giftSuggestion.giftName,
        gift_reasoning: giftSuggestion.reasoning,
        emotional_benefit: giftSuggestion.emotionalBenefit,
        confidence_score: giftSuggestion.confidence,
        affirmations,
      })
      .select()
      .single()

    // Update user's daily usage counter
    await supabase
      .from("user_profiles")
      .update({
        serendipity_used_today: (profile.serendipity_used_today || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    // Award XP for Pro+ users
    if (profile.tier !== "free") {
      await supabase.from("xp_logs").insert({
        user_id: session.user.id,
        xp_amount: 2,
        reason: "Serendipity revelation completed",
      })
    }

    return NextResponse.json({
      success: true,
      revelation_id: revelation.id,
      affirmations,
      gift_suggestion: giftSuggestion,
    })
  } catch (error) {
    console.error("Serendipity revelation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateAffirmations(emotionalState: string, occasionType: string) {
  const affirmationSets = {
    "overwhelmed-healing": [
      { text: "You're not too much—you're just finally feeling it all.", icon: "💝" },
      { text: "Some gifts don't need wrapping, just timing.", icon: "⏰" },
      { text: "Today is yours to reclaim.", icon: "🌟" },
    ],
    "nostalgic-anniversary": [
      { text: "The past is a gift you give to your future self.", icon: "🎁" },
      { text: "Memories are the only things that get better with time.", icon: "✨" },
      { text: "You've built something beautiful worth celebrating.", icon: "🏆" },
    ],
    "anxious-justbecause": [
      { text: "Your nervous system deserves kindness today.", icon: "🤗" },
      { text: "Small comforts can carry you through big storms.", icon: "☔" },
      { text: "You're allowed to need what you need.", icon: "💚" },
    ],
    default: [
      { text: "You deserve surprises that feel like coming home.", icon: "🏠" },
      { text: "The best gifts find you when you're not looking.", icon: "🔍" },
      { text: "Your intuition led you here for a reason.", icon: "🧭" },
    ],
  }

  // FIXED: Use regex to remove ALL whitespace, not just single spaces
  const key = `${emotionalState.toLowerCase()}-${occasionType.toLowerCase().replace(/\s+/g, "")}`
  return affirmationSets[key as keyof typeof affirmationSets] || affirmationSets.default
}

export async function generateGiftSuggestion(inputs: {
  occasion_type: string
  emotional_state: string
  recent_life_event?: string
  gift_frequency: string
  preferred_format: string
}) {
  // Mock AI gift generation logic - in production this would call your AI service
  const giftDatabase = {
    "overwhelmed-healing": {
      giftName: "Weighted Aromatherapy Hoodie",
      reasoning: "Comfort that hugs like a friend, smells like calm.",
      emotionalBenefit: "Emotional regulation, sensory calm",
      giftUrl: "/products/weighted-aromatherapy-hoodie",
      price: "$89.99",
      category: "Self-Care",
      confidence: 94,
    },
    "nostalgic-anniversary": {
      giftName: "Memory Constellation Lamp",
      reasoning: "Projects your shared moments into stars on the ceiling.",
      emotionalBenefit: "Connection to cherished memories",
      giftUrl: "/products/memory-constellation-lamp",
      price: "$124.99",
      category: "Sentimental",
      confidence: 91,
    },
    "anxious-justbecause": {
      giftName: "Worry Stone Garden Kit",
      reasoning: "Smooth stones for nervous hands, tiny plants for hope.",
      emotionalBenefit: "Grounding, mindful distraction",
      giftUrl: "/products/worry-stone-garden",
      price: "$34.99",
      category: "Mindfulness",
      confidence: 88,
    },
    default: {
      giftName: "Serendipity Box",
      reasoning: "A curated surprise that matches your current energy.",
      emotionalBenefit: "Unexpected joy, self-discovery",
      giftUrl: "/products/serendipity-box",
      price: "$49.99",
      category: "Mystery",
      confidence: 85,
    },
  }

  // FIXED: Use regex to remove ALL whitespace, not just single spaces
  const key = `${inputs.emotional_state.toLowerCase()}-${inputs.occasion_type.toLowerCase().replace(/\s+/g, "")}`
  return giftDatabase[key as keyof typeof giftDatabase] || giftDatabase.default
}
