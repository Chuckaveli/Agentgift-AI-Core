import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    // Mock employees data
    const mockEmployees = [
      { id: "1", email: "alice@agentgift.ai", tier: "pro_agent", created_at: "2024-01-15T00:00:00Z" },
      { id: "2", email: "bob@agentgift.ai", tier: "premium_spy", created_at: "2024-01-20T00:00:00Z" },
      { id: "3", email: "carol@agentgift.ai", tier: "agent_00g", created_at: "2024-02-01T00:00:00Z" },
      { id: "4", email: "david@agentgift.ai", tier: "admin", created_at: "2024-02-10T00:00:00Z" },
    ]

    let filteredEmployees = mockEmployees
    if (search) {
      filteredEmployees = mockEmployees.filter((emp) => emp.email.toLowerCase().includes(search.toLowerCase()))
    }

    return NextResponse.json({
      employees: filteredEmployees,
    })
  } catch (error) {
    console.error("Error in EmotiTokens employees API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
