import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { handleDelivery, type DeliveryOptions } from "@/lib/external-services"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, options } = body

    switch (action) {
      case "deliver":
        if (!options) {
          return NextResponse.json({ error: "Delivery options required" }, { status: 400 })
        }

        const result = await handleDelivery(session.user.id, options as DeliveryOptions)
        return NextResponse.json(result)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("External services API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "services":
        // Get user's connected services
        const { data: services, error } = await supabase
          .from("external_service_hooks")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("is_active", true)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ services })

      case "deliveries":
        // Get user's delivery history
        const { data: deliveries, error: deliveriesError } = await supabase
          .from("delivery_logs")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(50)

        if (deliveriesError) {
          return NextResponse.json({ error: deliveriesError.message }, { status: 500 })
        }

        return NextResponse.json({ deliveries })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("External services API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
