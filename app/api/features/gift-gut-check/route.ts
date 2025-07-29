import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"

export const POST = withAuth(async (request: Request, { user, deductCredits }) => {
  try {
    const { answers, giftDescription } = await request.json()

    // Deduct credits for using the feature
    const success = await deductCredits(1, "Gift Gut Check")
    if (!success) {
      return NextResponse.json(
        { error: "Insufficient credits", creditsNeeded: 1, creditsAvailable: user?.credits || 0 },
        { status: 402 }
      )
    }

    // Process gut check analysis
    const score = calculateGutCheckScore(answers)
    const recommendations = generateRecommendations(score, giftDescription)

    return NextResponse.json({
      success: true,
      score,
      recommendations,
      analysis: {
        personalness: answers[1] ? "High" : "Low",
        excitement: answers[2] ? "High" : "Low",
        personality_match: answers[3] ? "High" : "Low",
        appropriateness: answers[4] ? "High" : "Low",
      },
      xp_gained: 1,
    })
  } catch (error) {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
})

function calculateGutCheckScore(answers: Record<number, boolean>): number {
  const weights = { 1: 0.3, 2: 0.25, 3: 0.25, 4: 0.2 }
  let score = 0

  Object.entries(answers).forEach(([questionId, answer]) => {
    if (answer) {
      score += weights[Number.parseInt(questionId) as keyof typeof weights] || 0
    }
  })

  return Math.round(score * 100)
}

function generateRecommendations(score: number, description: string): string[] {
  if (score >= 80) {
    return [
      "Your gut instincts are spot on! This gift shows great thoughtfulness.",
      "Consider adding a personal note to make it even more special.",
      "Trust your choice - this gift will likely be well-received.",
    ]
  } else if (score >= 60) {
    return [
      "Good choice overall, but consider these improvements:",
      "Think about personalizing it more to their specific interests.",
      "Maybe add a complementary smaller gift to show extra thought.",
    ]
  } else {
    return [
      "Your gut is telling you to reconsider. Here's why:",
      "The gift might not feel personal enough for your relationship.",
      "Consider what they've mentioned wanting recently.",
      "Think about their hobbies, interests, or current life situation.",
    ]
  }
} 