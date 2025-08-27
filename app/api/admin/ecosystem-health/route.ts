import { type NextRequest, NextResponse } from "next/server"
import { fetchEcosystemHealth } from "@/lib/ecosystem-health"
import { withAdmin } from '@/lib/with-admin';

async function __orig_GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For demo purposes, we'll use a simple check
    // In production, verify JWT token and admin role
    const token = authHeader.replace("Bearer ", "")

    console.log("🔍 Fetching ecosystem health via API route...")

    const healthData = await fetchEcosystemHealth()

    console.log("✅ Ecosystem health data retrieved successfully")

    return NextResponse.json(healthData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("🚨 Ecosystem health API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch ecosystem health",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function __orig_POST(request: NextRequest) {
  try {
    // This endpoint can be used to manually trigger health updates
    const body = await request.json()

    console.log("🔄 Manual ecosystem health update triggered")

    const healthData = await fetchEcosystemHealth()

    return NextResponse.json({
      message: "Ecosystem health updated successfully",
      data: healthData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("🚨 Manual health update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update ecosystem health",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

const __orig_GET = withAdmin(__orig_GET);
export const GET = withAdmin(__orig_GET);
const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
