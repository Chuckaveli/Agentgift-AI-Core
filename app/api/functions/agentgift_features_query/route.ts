import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { category, tier_access, route_path } = await request.json()

    // Get user session from Authorization header
    const authHeader = request.headers.get("Authorization")
    let userTier = "Free" // Default to Free tier

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "")
        const {
          data: { user },
        } = await supabase.auth.getUser(token)

        if (user) {
          // Get user profile to determine tier
          const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", user.id).single()

          if (profile) {
            userTier = profile.tier
          }
        }
      } catch (error) {
        console.log("Auth error, defaulting to Free tier:", error)
      }
    }

    // Build query based on user tier
    let query = supabase.from("agentgift_features").select("*").eq("is_active", true)

    // Apply tier-based filtering
    const allowedTiers = getTiersForUser(userTier)
    query = query.in("tier_access", allowedTiers)

    // Apply additional filters
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (tier_access && tier_access !== "all") {
      query = query.eq("tier_access", tier_access)
    }

    if (route_path) {
      query = query.ilike("route_path", `%${route_path}%`)
    }

    // Order by category and feature name
    query = query.order("category").order("feature_name")

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getTiersForUser(userTier: string): string[] {
  switch (userTier) {
    case "Enterprise":
      return ["Free", "Pro", "Pro+", "Enterprise"]
    case "Pro+":
      return ["Free", "Pro", "Pro+"]
    case "Pro":
      return ["Free", "Pro"]
    default:
      return ["Free"]
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests by calling POST with empty body
  return POST(request)
}
