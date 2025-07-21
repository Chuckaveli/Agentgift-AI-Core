import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Alternative gift suggestions for second reveals
const ALTERNATIVE_SUGGESTIONS = {
  "self-care": [
    {
      name: "Silk Sleep Mask with Lavender",
      why_fits: "Rest is a radical act of self-love.",
      emotional_benefit: "Deep sleep and morning clarity",
      category: "wellness",
    },
    {
      name: "Gratitude Stone Collection",
      why_fits: "Tangible reminders of what grounds you.",
      emotional_benefit: "Mindfulness and appreciation",
      category: "mindfulness",
    },
  ],
  comfort: [
    {
      name: "Heated Neck Wrap",
      why_fits: "Warmth that melts away tension you didn't know you carried.",
      emotional_benefit: "Physical relief and emotional release",
      category: "comfort",
    },
    {
      name: "Cozy Reading Socks",
      why_fits: "Small luxuries that make ordinary moments special.",
      emotional_benefit: "Daily comfort and self-care",
      category: "comfort",
    },
  ],
  achievement: [
    {
      name: "Success Celebration Candle",
      why_fits: "Your achievements deserve their own atmosphere.",
      emotional_benefit: "Pride acknowledgment and ambiance",
      category: "celebration",
    },
    {
      name: "Personal Victory Bell",
      why_fits: "Ring it every time you accomplish something meaningful.",
      emotional_benefit: "Achievement recognition and motivation",
      category: "celebration",
    },
  ],
  wellness: [
    {
      name: "Morning Intention Cards",
      why_fits: "Start each day with purposeful direction.",
      emotional_benefit: "Clarity and intentional living",
      category: "mindfulness",
    },
    {
      name: "Breathing Exercise Guide",
      why_fits: "The most powerful tool you have is always with you.",
      emotional_benefit: "Stress relief and emotional regulation",
      category: "wellness",
    },
  ],
}

const generateReflectionCaption = (suggestion: any) => {
  const captions = [
    `Second reveal magic: ${suggestion.name}. The universe has layers of wisdom.`,
    `Another perfect match: ${suggestion.name}. Sometimes we need multiple gifts to feel complete.`,
    `Serendipity strikes twice: ${suggestion.name}. Trust the process of discovery.`,
    `The gift that came after: ${suggestion.name}. Perfect timing, perfect choice. ✨`,
  ]

  return captions[Math.floor(Math.random() * captions.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id } = body

    // Get original session
    const { data: session, error: sessionError } = await supabase
      .from("serendipity_sessions")
      .select("*")
      .eq("id", session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check user tier (mock - in real app, check user_profiles)
    const userTier = "pro_agent" // Mock pro tier

    if (userTier === "free_agent") {
      return NextResponse.json({ error: "Upgrade to Pro to reveal multiple surprises" }, { status: 403 })
    }

    // Get original gift category
    const originalCategory = session.gift_suggestion?.category || "wellness"

    // Get alternative suggestions
    const alternatives =
      ALTERNATIVE_SUGGESTIONS[originalCategory as keyof typeof ALTERNATIVE_SUGGESTIONS] ||
      ALTERNATIVE_SUGGESTIONS.wellness

    // Pick random alternative
    const randomIndex = Math.floor(Math.random() * alternatives.length)
    const newSuggestion = alternatives[randomIndex]

    const gift_suggestion = {
      ...newSuggestion,
      gift_url: `https://agentgift.ai/gifts/${newSuggestion.category}?ref=serendipity-second`,
      reflection_caption: generateReflectionCaption(newSuggestion),
    }

    // Update session with new suggestion and add XP
    const { data: updatedSession, error: updateError } = await supabase
      .from("serendipity_sessions")
      .update({
        gift_suggestion,
        xp_earned: session.xp_earned + 2, // +2 XP for second reveal
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log the additional XP earned
    await supabase.from("xp_logs").insert({
      user_id: session.user_id,
      xp_amount: 2,
      reason: "Serendipity Circuit - Second Reveal",
      feature: "serendipity_circuit",
    })

    return NextResponse.json({
      gift_suggestion,
      xp_earned: 2,
      total_xp: updatedSession.xp_earned,
    })
  } catch (error) {
    console.error("Error revealing another gift:", error)
    return NextResponse.json({ error: "Failed to reveal another gift" }, { status: 500 })
  }
}
