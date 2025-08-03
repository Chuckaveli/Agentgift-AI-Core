import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    // Validate required environment variables
    const apiKey = process.env.WHISPER_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Whisper API key not configured" }, { status: 500 })
    }

    // Validate input
    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Prepare form data for OpenAI Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", "whisper-1")

    // Call OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Whisper API error:", errorText)
      return NextResponse.json({ error: "Failed to transcribe audio" }, { status: response.status })
    }

    const result = await response.json()

    return NextResponse.json({
      text: result.text,
      success: true,
    })
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
