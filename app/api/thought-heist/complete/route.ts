import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, finalScore, teamMembers, completionTime, answers } = body

    // Update session as completed
    const { error: sessionError } = await supabase
      .from("thought_heist_sessions")
      .update({
        is_active: false,
        final_score: finalScore,
        completion_time: completionTime,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    if (sessionError) throw sessionError

    // Save team member results
    const memberResults = teamMembers.map((member: any) => ({
      session_id: sessionId,
      player_name: member.name,
      xp_earned: member.xp,
      nickname: member.nickname,
      created_at: new Date().toISOString(),
    }))

    const { error: membersError } = await supabase.from("thought_heist_results").insert(memberResults)

    if (membersError) throw membersError

    // Save answers
    const answerRecords = answers.map((answer: string, index: number) => ({
      session_id: sessionId,
      phase_number: index + 1,
      answer_text: answer,
      created_at: new Date().toISOString(),
    }))

    const { error: answersError } = await supabase.from("thought_heist_answers").insert(answerRecords)

    if (answersError) throw answersError

    // Generate replay code
    const replayCode = `HEIST-${Date.now().toString(36).toUpperCase()}`

    return NextResponse.json({
      success: true,
      replayCode,
      message: "Heist completed successfully!",
    })
  } catch (error) {
    console.error("Error completing heist:", error)
    return NextResponse.json({ error: "Failed to complete heist" }, { status: 500 })
  }
}
