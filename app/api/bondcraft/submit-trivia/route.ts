import { type NextRequest, NextResponse } from "next/server"
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { session_id, trivia_answers } = await request.json()

    // Validate input
    if (!session_id || !trivia_answers || !Array.isArray(trivia_answers)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update session with trivia answers
    const { data: session, error: updateError } = await supabase
      .from("bondcraft_sessions")
      .update({
        trivia_answers: trivia_answers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating session:", updateError)
      return NextResponse.json({ error: "Failed to save trivia answers" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Trivia answers saved successfully",
    })
  } catch (error) {
    console.error("Error in submit-trivia:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
