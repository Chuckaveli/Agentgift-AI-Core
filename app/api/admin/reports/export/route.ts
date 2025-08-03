import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { format, data, timeRange } = await request.json()

    if (format === "json") {
      const exportData = {
        exportDate: new Date().toISOString(),
        timeRange,
        ...data,
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="agentgift-reports-${timeRange}-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    }

    if (format === "email") {
      // Here you would integrate with your email service (Resend, etc.)
      // For now, we'll just return success
      return NextResponse.json({ success: true, message: "Report emailed successfully" })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
