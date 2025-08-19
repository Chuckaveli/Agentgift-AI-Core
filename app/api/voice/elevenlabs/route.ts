import { type NextRequest, NextResponse } from "next/server"
import { generateElevenLabsAudio } from "@/lib/external-services"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { text, voiceId } = await req.json()

    if (!text || !voiceId) {
      return new NextResponse("Missing text or voiceId", { status: 400 })
    }

    const audio = await generateElevenLabsAudio(text, voiceId, env.ELEVENLABS_API_KEY)

    if (!audio) {
      return new NextResponse("Failed to generate audio", { status: 500 })
    }

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
