import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Mock services data since tables may not exist
    const mockServices = [
      {
        id: "1",
        name: "Gift Concierge",
        description: "AI-powered personalized gift recommendations",
        category: "gifting",
        status: "active",
        usage_count: 1250,
        satisfaction_score: 4.8,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Cultural Intelligence",
        description: "Cross-cultural gift guidance and etiquette",
        category: "culture",
        status: "active",
        usage_count: 890,
        satisfaction_score: 4.6,
        created_at: "2024-01-15T00:00:00Z",
      },
      {
        id: "3",
        name: "Smart Search",
        description: "Advanced gift discovery and filtering",
        category: "search",
        status: "active",
        usage_count: 750,
        satisfaction_score: 4.7,
        created_at: "2024-02-01T00:00:00Z",
      },
      {
        id: "4",
        name: "Emotion Engine",
        description: "Emotional analysis for gift matching",
        category: "analysis",
        status: "beta",
        usage_count: 320,
        satisfaction_score: 4.9,
        created_at: "2024-02-15T00:00:00Z",
      },
    ]

    let filteredServices = mockServices
    if (category && category !== "all") {
      filteredServices = mockServices.filter((service) => service.category === category)
    }

    return NextResponse.json({
      services: filteredServices,
      total: filteredServices.length,
    })
  } catch (error) {
    console.error("Services API error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const { name, description, category, status = "active" } = body

    if (!name || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock service creation
    const newService = {
      id: Date.now().toString(),
      name,
      description,
      category,
      status,
      usage_count: 0,
      satisfaction_score: 0,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      service: newService,
    })
  } catch (error) {
    console.error("Services API error:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
