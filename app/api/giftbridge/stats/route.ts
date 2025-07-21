import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock stats data
    const stats = {
      totalNominations: 15847,
      totalVotes: 89234,
      countriesParticipating: 67,
      currentSeason: "Q1 2024",
      timeUntilFinale: "89 days",
      monthlyWinners: 12,
      totalXPAwarded: 4567890,
      totalCreditsSpent: 316940,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
