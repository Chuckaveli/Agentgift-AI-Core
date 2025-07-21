import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Affirmation templates based on emotional state and occasion
const AFFIRMATION_TEMPLATES = {
  healing: [
    "You're not broken, you're breaking through.",
    "Some gifts don't need wrapping, just timing.",
    "Today is yours to reclaim.",
  ],
  celebration: [
    "You deserve to be celebrated, especially by yourself.",
    "Joy isn't selfish—it's necessary.",
    "This moment is worth honoring.",
  ],
  comfort: [
    "You're not too much—you're just finally feeling it all.",
    "Comfort isn't weakness, it's wisdom.",
    "You deserve softness in a hard world.",
  ],
  milestone: [
    "Every step forward deserves recognition.",
    "You've earned this moment of acknowledgment.",
    "Progress isn't always visible, but it's always valuable.",
  ],
  default: [
    "You're exactly where you need to be.",
    "Some gifts find us when we need them most.",
    "Trust your instincts—they led you here.",
  ],
}

// Gift suggestion logic based on inputs
const generateGiftSuggestion = (inputs: any) => {
  const { occasion_type, emotional_state, recent_life_event, gift_frequency } = inputs

  // Emotional triangulation logic
  const suggestions = {
    healing_breakup: {
      name: "Self-Love Ritual Kit",
      why_fits: "Healing requires intentional self-care rituals that honor your journey.",
      emotional_benefit: "Self-compassion and emotional regulation",
      category: "self-care",
    },
    healing_burnout: {
      name: "Weighted Aromatherapy Hoodie",
      why_fits: "Comfort that hugs like a friend, smells like calm.",
      emotional_benefit: "Emotional regulation and sensory calm",
      category: "comfort",
    },
    celebration_achievement: {
      name: "Victory Journal with Gold Pen",
      why_fits: "Your wins deserve to be documented in something beautiful.",
      emotional_benefit: "Pride acknowledgment and future motivation",
      category: "achievement",
    },
    comfort_general: {
      name: "Memory Foam Reading Pillow",
      why_fits: "Sometimes the best gift is permission to rest deeply.",
      emotional_benefit: "Physical comfort and mental peace",
      category: "comfort",
    },
    milestone_general: {
      name: "Time Capsule Letter Kit",
      why_fits: "Capture this moment for your future self to discover.",
      emotional_benefit: "Reflection and future connection",
      category: "reflection",
    },
    default: {
      name: "Mindful Moments Tea Collection",
      why_fits: "Small rituals create big changes in how we feel.",
      emotional_benefit: "Mindfulness and daily joy",
      category: "wellness",
    },
  }

  // Generate key based on inputs
  let key = "default"
  if (occasion_type.toLowerCase() === "healing" && recent_life_event) {
    key = `healing_${recent_life_event.toLowerCase().replace(" ", "_")}`
  } else if (occasion_type.toLowerCase() === "celebration") {
    key = "celebration_achievement"
  } else if (occasion_type.toLowerCase() === "comfort") {
    key = "comfort_general"
  } else if (occasion_type.toLowerCase() === "milestone") {
    key = "milestone_general"
  }

  const suggestion = suggestions[key as keyof typeof suggestions] || suggestions.default

  return {
    ...suggestion,
    gift_url: `https://agentgift.ai/gifts/${suggestion.category}?ref=serendipity`,
    reflection_caption: generateReflectionCaption(inputs, suggestion),
  }
}

const generateReflectionCaption = (inputs: any, suggestion: any) => {
  const captions = [
    `Sometimes the universe knows what we need before we do. Today I discovered: ${suggestion.name}`,
    `My SerendipityCircuit reveal: ${suggestion.name}. The timing couldn't be more perfect.`,
    `Found through emotional discovery: ${suggestion.name}. Exactly what my soul was asking for.`,
    `The gift I didn't know I needed: ${suggestion.name}. Trust the process. ✨`,
  ]

  return captions[Math.floor(Math.random() * captions.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { occasion_type, emotional_state, recent_life_event, gift_frequency, preferred_format } = body

    // Mock user ID - in real app, get from auth
    const user_id = "demo-user-123"

    // Check if free user has already used their reveal
    const { data: existingSessions } = await supabase
      .from("serendipity_sessions")
      .select("id")
      .eq("user_id", user_id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    // For demo, assume free tier
    if (existingSessions && existingSessions.length > 0) {
      return NextResponse.json({ error: "Free users get one surprise reveal per day" }, { status: 403 })
    }

    // Generate affirmations based on occasion and emotional state
    const occasionKey = occasion_type.toLowerCase().replace(" ", "_")
    const affirmations =
      AFFIRMATION_TEMPLATES[occasionKey as keyof typeof AFFIRMATION_TEMPLATES] || AFFIRMATION_TEMPLATES.default

    // Generate gift suggestion
    const gift_suggestion = generateGiftSuggestion({
      occasion_type,
      emotional_state,
      recent_life_event,
      gift_frequency,
    })

    // Calculate XP (base 5 XP for revelation)
    const xp_earned = 5

    // Create session
    const { data: session, error } = await supabase
      .from("serendipity_sessions")
      .insert({
        user_id,
        occasion_type,
        emotional_state,
        recent_life_event,
        gift_frequency,
        preferred_format,
        affirmations,
        gift_suggestion,
        xp_earned,
        is_saved: false,
        is_shared: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Add XP to user profile (mock implementation)
    // In real app, update user's XP in user_profiles table

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error creating serendipity session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id") || "demo-user-123"

    const { data: sessions, error } = await supabase
      .from("serendipity_sessions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}
