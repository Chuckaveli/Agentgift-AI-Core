import { type NextRequest, NextResponse } from "next/server"
const REFLECTION_QUOTES = [
  "Perfect matches show how deeply you understand each other's hearts.",
  "Every match reveals the invisible threads that connect your souls.",
  "Understanding grows stronger with each shared moment of recognition.",
  "Love is found in the details you remember about each other.",
  "The best relationships are built on truly seeing and knowing one another.",
]

const ENCOURAGEMENT_QUOTES = [
  "Every relationship is a journey of discovery - keep exploring together.",
  "Understanding deepens with time, patience, and curiosity about each other.",
  "The beauty of love lies in learning something new about each other every day.",
  "Growing closer happens one conversation, one question, one answer at a time.",
  "True intimacy is built through the courage to keep asking and sharing.",
]

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { session_id, partner_guesses } = await request.json()

    // Validate input
    if (!session_id || !partner_guesses || !Array.isArray(partner_guesses)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate score
    const matches = partner_guesses.filter((guess) => guess.is_match)
    const score = matches.length
    const totalQuestions = partner_guesses.length

    // Calculate XP based on score and user tier
    let xp_earned = score * 10 // Base XP per match
    if (score === totalQuestions) {
      xp_earned += 50 // Perfect match bonus
    }

    // Get session to check user tier
    const { data: session } = await supabase.from("bondcraft_sessions").select("user_id").eq("id", session_id).single()

    if (session) {
      // Get user profile to check tier
      const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", session.user_id).single()

      // Free users don't get XP bonuses
      if (profile?.tier === "free_agent") {
        xp_earned = Math.min(xp_earned, 25) // Cap XP for free users
      }
    }

    // Select appropriate reflection quote
    const reflection_quote =
      score === totalQuestions
        ? REFLECTION_QUOTES[Math.floor(Math.random() * REFLECTION_QUOTES.length)]
        : ENCOURAGEMENT_QUOTES[Math.floor(Math.random() * ENCOURAGEMENT_QUOTES.length)]

    // Update session with final results
    const { data: updatedSession, error: updateError } = await supabase
      .from("bondcraft_sessions")
      .update({
        partner_guesses: partner_guesses,
        score: score,
        xp_earned: xp_earned,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating session:", updateError)
      return NextResponse.json({ error: "Failed to save results" }, { status: 500 })
    }

    // Update user XP if session exists
    if (session) {
      await supabase.rpc("add_user_xp", {
        user_id: session.user_id,
        xp_amount: xp_earned,
      })
    }

    // Generate bond report
    const bond_report = {
      total_score: score,
      total_questions: totalQuestions,
      match_percentage: Math.round((score / totalQuestions) * 100),
      strongest_categories: matches.map((m) => m.category || "General"),
      growth_areas: partner_guesses.filter((g) => !g.is_match).map((g) => g.category || "General"),
      insights: generateInsights(score, totalQuestions, matches),
    }

    return NextResponse.json({
      score,
      xp_earned,
      reflection_quote,
      bond_report,
      success: true,
    })
  } catch (error) {
    console.error("Error in submit-guesses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateInsights(score: number, total: number, matches: any[]) {
  const percentage = (score / total) * 100

  if (percentage === 100) {
    return "Perfect harmony! You two have an exceptional understanding of each other's inner world."
  } else if (percentage >= 80) {
    return "Strong connection! You're very attuned to each other's thoughts and feelings."
  } else if (percentage >= 60) {
    return "Good foundation! There's solid understanding with room for deeper exploration."
  } else if (percentage >= 40) {
    return "Growing bond! Keep communicating and asking questions to strengthen your connection."
  } else {
    return "Discovery phase! Every relationship grows through curiosity and open conversation."
  }
}
