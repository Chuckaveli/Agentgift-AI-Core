import { type NextRequest, NextResponse } from "next/server"
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const { sessionId, clueId, answer, isCorrect, xpEarned, timeSpent } = body

    // Record the clue answer
    const { data: clueAnswer, error: clueError } = await supabase
      .from("ghost_hunt_clue_answers")
      .insert({
        session_id: sessionId,
        clue_id: clueId,
        answer,
        is_correct: isCorrect,
        xp_earned: xpEarned,
        time_spent: timeSpent,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (clueError) throw clueError

    // Update session progress
    const { data: session, error: sessionError } = await supabase
      .from("ghost_hunt_sessions")
      .update({
        current_clue: body.nextClue,
        total_xp: body.newTotalXP,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single()

    if (sessionError) throw sessionError

    return NextResponse.json({ success: true, clueAnswer, session })
  } catch (error) {
    console.error("Error submitting clue answer:", error)
    return NextResponse.json(
      {
        error: "Failed to submit answer",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const { data: answers, error } = await supabase
      .from("ghost_hunt_clue_answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("submitted_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ answers })
  } catch (error) {
    console.error("Error fetching clue answers:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch answers",
      },
      { status: 500 },
    )
  }
}
