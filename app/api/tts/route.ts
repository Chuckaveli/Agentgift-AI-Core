import { type NextRequest, NextResponse } from "next/server"
import { appRouter } from "@/trpc/router"
import { createContext } from "@/trpc/context"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const caller = appRouter.createCaller(await createContext())
    const body = await req.json()
    const result = await caller.tts.request(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("TTS API error:", error)
    return NextResponse.json({ error: "Failed to create TTS request" }, { status: 500 })
  }
}
