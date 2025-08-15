import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio to text using Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", "whisper-1")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHISPER_API_KEY}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      throw new Error("Whisper API request failed")
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      transcription: result.text,
    })
  } catch (error) {
    console.error("Whisper API error:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
