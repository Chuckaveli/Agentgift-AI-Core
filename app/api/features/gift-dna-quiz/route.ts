import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"

export const POST = withAuth(async (request: Request, { user, deductCredits }) => {
  try {
    const { answers } = await request.json()

    // Deduct credits for using the feature
    const success = await deductCredits(1, "Gift DNA Quiz")
    if (!success) {
      return NextResponse.json(
        { error: "Insufficient credits", creditsNeeded: 1, creditsAvailable: user?.credits || 0 },
        { status: 402 }
      )
    }

    // Calculate personality scores
    const scores: Record<string, number> = {
      thoughtful: 0,
      emotional: 0,
      creative: 0,
      practical: 0,
      showoff: 0,
      spontaneous: 0,
    }

    // Mock calculation based on answers
    Object.entries(answers).forEach(([questionId, answer]) => {
      // This would be more sophisticated in a real implementation
      if (answer === "a") {
        scores.thoughtful += 2
        scores.emotional += 1
      } else if (answer === "b") {
        scores.creative += 2
        scores.spontaneous += 1
      } else if (answer === "c") {
        scores.practical += 2
        scores.thoughtful += 1
      } else if (answer === "d") {
        scores.showoff += 2
        scores.emotional += 1
      }
    })

    // Find primary and secondary types
    const sortedTypes = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    const totalPoints = Object.values(scores).reduce((sum, score) => sum + score, 0)

    // Calculate percentages
    const percentages: Record<string, number> = {}
    Object.keys(scores).forEach((type) => {
      percentages[type] = totalPoints > 0 ? Math.round((scores[type] / totalPoints) * 100) : 0
    })

    const primaryType = sortedTypes[0][0]
    const secondaryType = sortedTypes[1][0]

    const result = {
      primary: {
        type: primaryType,
        percentage: percentages[primaryType],
        score: scores[primaryType],
      },
      secondary: {
        type: secondaryType,
        percentage: percentages[secondaryType],
        score: scores[secondaryType],
      },
      allScores: scores,
      allPercentages: percentages,
    }

    return NextResponse.json({
      success: true,
      result,
      xp_gained: 2,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to calculate results" }, { status: 500 })
  }
}) 