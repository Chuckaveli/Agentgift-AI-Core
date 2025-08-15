import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { sign } from "jsonwebtoken"
import { z } from "zod"

// Demo payload validation schema
const demoPayloadSchema = z.object({
  recipient: z.string().min(1, "Recipient name is required"),
  emotions: z.array(z.string()).min(1, "At least one emotion is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  outputs: z
    .array(
      z.object({
        type: z.enum(["meaningful", "unconventional", "otb"]),
        text: z.string().min(1, "Gift text is required"),
        rationale: z.string().min(1, "Rationale is required"),
      }),
    )
    .min(1, "At least one gift output is required"),
  source: z.string().default("landing-demo"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate payload
    const validatedPayload = demoPayloadSchema.parse(body)

    // Create server client
    const supabase = createAdminClient()

    // Insert demo session
    const { data: demoSession, error: demoError } = await supabase
      .from("demo_sessions")
      .insert({
        payload: validatedPayload,
        source: validatedPayload.source,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })
      .select()
      .single()

    if (demoError) {
      console.error("Demo session creation error:", demoError)
      throw new Error("Failed to save demo session")
    }

    // Create demo token (JWT)
    const demoToken = sign(
      {
        demoSessionId: demoSession.id,
        exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10 minutes
      },
      process.env.ORCHESTRATOR_SIGNING_SECRET!,
    )

    // Log to webhook
    await logToWebhook("finish-demo", {
      demoSessionId: demoSession.id,
      recipient: validatedPayload.recipient,
      outputCount: validatedPayload.outputs.length,
      source: validatedPayload.source,
    })

    // Create response with demo token cookie
    const response = NextResponse.json({
      ok: true,
      next: "/auth?redirect=/dashboard",
      demoSessionId: demoSession.id,
    })

    // Set HttpOnly cookie for demo token
    response.cookies.set("demo_token", demoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Finish demo error:", error)

    // Log error to webhook
    await logToWebhook("finish-demo-error", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid payload", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}

async function logToWebhook(event: string, data: any) {
  try {
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          source: "orchestrator",
        }),
      })
    }
  } catch (error) {
    console.error("Webhook logging failed:", error)
  }
}
