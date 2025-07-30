import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has employee access
    const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", session.user.id).single()

    if (!profile || !["premium_spy", "pro_agent", "agent_00g", "admin", "super_admin"].includes(profile.tier)) {
      return NextResponse.json({ error: "Employee access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    // Get all employees (excluding current user)
    let query = supabase
      .from("user_profiles")
      .select("id, email, tier, created_at")
      .in("tier", ["premium_spy", "pro_agent", "agent_00g", "admin", "super_admin"])
      .neq("id", session.user.id)
      .order("email", { ascending: true })

    if (search) {
      query = query.ilike("email", `%${search}%`)
    }

    const { data: employees, error } = await query

    if (error) {
      console.error("Error fetching employees:", error)
      return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
    }

    return NextResponse.json({
      employees: employees || [],
    })
  } catch (error) {
    console.error("Error in EmotiTokens employees API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
