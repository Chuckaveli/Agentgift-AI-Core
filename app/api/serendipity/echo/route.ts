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
    const { revelation_id } = body

    // Check if user has Premium access
    const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", session.user.id).single()

    if (!profile || !["premium", "pro_agent", "agent_00g", "business", "enterprise"].includes(profile.tier)) {
      return NextResponse.json({ error: "Premium access required for Echo Gifts" }, { status: 403 })
    }

    // Get the original revelation
    const { data: revelation } = await supabase
      .from("serendipity_sessions")
      .select("*")
      .eq("id", revelation_id)
      .eq("user_id", session.user.id)
      .single()

    if (!revelation) {
      return NextResponse.json({ error: "Revelation not found" }, { status: 404 })
    }

    // Generate echo gifts based on the original theme
    const echoGifts = generateEchoGifts(revelation)

    // Record the echo session
    await supabase.from("serendipity_echo_sessions").insert({
      user_id: session.user.id,
      original_revelation_id: revelation_id,
      echo_gifts: echoGifts,
    })

    return NextResponse.json({
      success: true,
      echo_gifts: echoGifts,
    })
  } catch (error) {
    console.error("Echo gifts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateEchoGifts(originalRevelation: any) {
  // Generate theme-linked follow-up suggestions
  const echoPatterns = {
    "Self-Care": [
      {
        giftName: "Mindful Breathing Necklace",
        reasoning: "A discrete reminder to pause and breathe during overwhelming moments.",
        emotionalBenefit: "Anxiety management, presence",
        category: "Wellness",
        connection: "Complements your comfort needs",
      },
      {
        giftName: "Texture Therapy Kit",
        reasoning: "Different textures for sensory grounding when emotions feel too big.",
        emotionalBenefit: "Sensory regulation, focus",
        category: "Self-Care",
        connection: "Extends your tactile comfort",
      },
    ],
    Sentimental: [
      {
        giftName: "Voice Memory Bottle",
        reasoning: "Capture and replay loving words when you need to hear them most.",
        emotionalBenefit: "Emotional support, connection",
        category: "Memory",
        connection: "Builds on your memory theme",
      },
      {
        giftName: "Timeline Bracelet",
        reasoning: "Small charms representing milestone moments you've shared.",
        emotionalBenefit: "Celebration, continuity",
        category: "Sentimental",
        connection: "Honors your journey together",
      },
    ],
    Mindfulness: [
      {
        giftName: "Worry Transformation Journal",
        reasoning: "Convert anxious thoughts into actionable steps or creative expression.",
        emotionalBenefit: "Problem-solving, creativity",
        category: "Growth",
        connection: "Evolves your grounding practice",
      },
      {
        giftName: "Calming Sound Stones",
        reasoning: "Natural stones that produce soothing sounds when touched together.",
        emotionalBenefit: "Meditation, peace",
        category: "Mindfulness",
        connection: "Complements your tactile needs",
      },
    ],
  }

  const category = originalRevelation.category || "Mystery"
  const echoes = echoPatterns[category as keyof typeof echoPatterns] || [
    {
      giftName: "Surprise Echo Box",
      reasoning: "A follow-up mystery that builds on your original discovery.",
      emotionalBenefit: "Continued discovery, joy",
      category: "Mystery",
      connection: "Extends your serendipity journey",
    },
  ]

  return echoes.slice(0, 2) // Return 2 echo suggestions
}
