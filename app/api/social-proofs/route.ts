import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock social proof data
    const mockProofs = [
      {
        id: "1",
        type: "testimonial",
        content: "AgentGift helped me find the perfect anniversary gift. My partner was amazed!",
        author_name: "Sarah M.",
        author_title: "Happy Customer",
        rating: 5,
        verified: true,
        created_at: "2024-01-15T00:00:00Z",
      },
      {
        id: "2",
        type: "review",
        content: "The AI recommendations were spot-on. Saved me hours of searching!",
        author_name: "Mike R.",
        author_title: "Verified Buyer",
        rating: 5,
        verified: true,
        created_at: "2024-01-20T00:00:00Z",
      },
      {
        id: "3",
        type: "stat",
        content: "94% of users find the perfect gift on their first try",
        metric_value: 94,
        metric_label: "Success Rate",
        created_at: "2024-02-01T00:00:00Z",
      },
      {
        id: "4",
        type: "testimonial",
        content: "Finally, a gift service that understands emotional connection!",
        author_name: "Jennifer L.",
        author_title: "Pro User",
        rating: 5,
        verified: true,
        created_at: "2024-02-10T00:00:00Z",
      },
    ]

    let filteredProofs = mockProofs
    if (type && type !== "all") {
      filteredProofs = mockProofs.filter((proof) => proof.type === type)
    }

    // Limit results
    filteredProofs = filteredProofs.slice(0, limit)

    return NextResponse.json({
      social_proofs: filteredProofs,
      total: filteredProofs.length,
    })
  } catch (error) {
    console.error("Social proofs API error:", error)
    return NextResponse.json({ error: "Failed to fetch social proofs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const { type, content, author_name, author_title, rating, verified = false } = body

    if (!type || !content) {
      return NextResponse.json({ error: "Type and content are required" }, { status: 400 })
    }

    // Mock social proof creation
    const newProof = {
      id: Date.now().toString(),
      type,
      content,
      author_name,
      author_title,
      rating,
      verified,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      social_proof: newProof,
    })
  } catch (error) {
    console.error("Social proofs API error:", error)
    return NextResponse.json({ error: "Failed to create social proof" }, { status: 500 })
  }
}
