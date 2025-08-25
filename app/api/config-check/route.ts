import { NextResponse } from "next/server"
import { env, isSupabaseConfigured, getBaseUrl } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const configStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      baseUrl: getBaseUrl(),
      supabase: {
        configured: isSupabaseConfigured(),
        url: env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
      },
      bff: {
        url: env.NEXT_PUBLIC_BFF_URL || "Not configured",
        configured: !!env.NEXT_PUBLIC_BFF_URL,
      },
      apis: {
        openai: env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing",
        elevenlabs: env.ELEVENLABS_API_KEY ? "✅ Set" : "❌ Missing",
        whisper: env.WHISPER_API_KEY ? "✅ Set" : "❌ Missing",
        stripe: env.STRIPE_SECRET_KEY ? "✅ Set" : "❌ Missing",
      },
    }

    return NextResponse.json({
      status: "healthy",
      message: "Configuration check completed",
      config: configStatus,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Configuration check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
