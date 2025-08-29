import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "missing",
      bffUrl: process.env.NEXT_PUBLIC_BFF_URL ? "configured" : "not set",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ? "configured" : "not set",
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }

    const issues = []

    // Check required variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      issues.push("NEXT_PUBLIC_SUPABASE_URL is required")
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      issues.push("SUPABASE_SERVICE_ROLE_KEY is required")
    }

    // Check URL formats
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
      issues.push("NEXT_PUBLIC_SUPABASE_URL should start with https://")
    }

    if (process.env.NEXT_PUBLIC_BFF_URL && !process.env.NEXT_PUBLIC_BFF_URL.startsWith("http")) {
      issues.push("NEXT_PUBLIC_BFF_URL should start with http:// or https://")
    }

    const status = issues.length === 0 ? "healthy" : "issues_found"

    return NextResponse.json({
      status,
      config,
      issues,
      message:
        issues.length === 0 ? "All configuration checks passed" : `Found ${issues.length} configuration issue(s)`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check configuration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
