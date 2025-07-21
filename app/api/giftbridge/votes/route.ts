import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nominationId, userId } = body

    if (!nominationId || !userId) {
      return NextResponse.json({ success: false, error: "Missing nomination ID or user ID" }, { status: 400 })
    }

    // Check if user already voted this season (mock - in real app, check Supabase)
    const userVotesThisSeason = [] // Mock - get from database
    const hasVotedForNomination = userVotesThisSeason.includes(nominationId)

    if (hasVotedForNomination) {
      return NextResponse.json(
        { success: false, error: "You have already voted for this nomination this season" },
        { status: 400 },
      )
    }

    // Record vote (mock - in real app, insert into Supabase)
    console.log(`User ${userId} voted for nomination ${nominationId}`)

    // Update nomination vote count (mock - in real app, increment in Supabase)
    console.log(`Incremented vote count for nomination ${nominationId}`)

    // Award XP (mock - in real app, update user XP in Supabase)
    console.log(`Awarded 500 XP to user ${userId} for voting`)

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully! 500 XP awarded.",
      xpAwarded: 500,
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

    // Get user's votes for current season (mock - in real app, fetch from Supabase)
    const userVotes = ["1", "3"] // Mock user votes

    return NextResponse.json({
      success: true,
      votes: userVotes,
    })
  } catch (error) {
    console.error("Error fetching user votes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user votes" }, { status: 500 })
  }
}
