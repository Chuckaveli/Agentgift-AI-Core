import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock stats - in real app, calculate from Supabase
    const stats = {
      totalNominations: 1247,
      totalVotes: 45892,
      activeCountries: 23,
      currentFinalists: 12,
      totalCreditsSpent: 24940,
      totalXPAwarded: 2294600,
      monthlyWinners: 8,
      seasonsCompleted: 3,
    }

    // Top countries by nominations
    const topCountries = [
      { country: "United States", nominations: 234, votes: 12456 },
      { country: "Brazil", nominations: 189, votes: 9876 },
      { country: "Japan", nominations: 156, votes: 8234 },
      { country: "Germany", nominations: 134, votes: 7123 },
      { country: "Canada", nominations: 98, votes: 5432 },
    ]

    // Recent activity
    const recentActivity = [
      {
        type: "nomination",
        message: "New nomination from Brazil",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      },
      {
        type: "vote",
        message: "1000+ votes reached for James Mitchell",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      },
      {
        type: "finalist",
        message: "Yuki Tanaka selected as finalist",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      },
    ]

    return NextResponse.json({
      success: true,
      stats,
      topCountries,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching GiftBridge stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
