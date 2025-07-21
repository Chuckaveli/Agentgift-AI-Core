import { type NextRequest, NextResponse } from "next/server"

// Mock user votes storage (in real app, this would be in database)
const mockUserVotes: Record<string, string[]> = {
  "mock-user-123": ["1", "3"], // User has voted for nominations 1 and 3
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nominationId, userId } = body

    if (!nominationId || !userId) {
      return NextResponse.json({ success: false, error: "Missing nomination ID or user ID" }, { status: 400 })
    }

    // Check if user already voted for this nomination
    const userVotes = mockUserVotes[userId] || []
    if (userVotes.includes(nominationId)) {
      return NextResponse.json(
        { success: false, error: "You have already voted for this nomination this season" },
        { status: 400 },
      )
    }

    // Record the vote
    if (!mockUserVotes[userId]) {
      mockUserVotes[userId] = []
    }
    mockUserVotes[userId].push(nominationId)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully! 50 XP awarded.",
      xpAwarded: 50,
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ success: false, error: "Failed to record vote" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    // Get user's votes
    const userVotes = mockUserVotes[userId] || []

    return NextResponse.json({
      success: true,
      votes: userVotes,
    })
  } catch (error) {
    console.error("Error fetching user votes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user votes" }, { status: 500 })
  }
}
