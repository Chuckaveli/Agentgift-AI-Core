import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("emotitokens_employees")
      .select(
        `
        *,
        emotitokens_balances (
          total_tokens,
          available_tokens,
          locked_tokens
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (department) {
      query = query.eq("department", department)
    }

    const { data: employees, error } = await query

    if (error) {
      console.error("Error fetching employees:", error)
      return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
    }

    return NextResponse.json({ employees })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, department, position, manager_id, initial_tokens } = body

    if (!name || !email || !department) {
      return NextResponse.json({ error: "Name, email, and department are required" }, { status: 400 })
    }

    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from("emotitokens_employees")
      .select("id")
      .eq("email", email)
      .single()

    if (existingEmployee) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 409 })
    }

    // Create employee
    const { data: employee, error: employeeError } = await supabase
      .from("emotitokens_employees")
      .insert([
        {
          name,
          email,
          department,
          position,
          manager_id,
          status: "active",
        },
      ])
      .select()
      .single()

    if (employeeError) {
      console.error("Error creating employee:", employeeError)
      return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
    }

    // Create initial balance if specified
    if (initial_tokens && initial_tokens > 0) {
      const { error: balanceError } = await supabase.from("emotitokens_balances").insert([
        {
          user_id: employee.id,
          total_tokens: initial_tokens,
          available_tokens: initial_tokens,
          locked_tokens: 0,
        },
      ])

      if (balanceError) {
        console.error("Error creating initial balance:", balanceError)
        // Don't fail the request if balance creation fails
      }

      // Log initial token grant
      const { error: logError } = await supabase.from("emotitokens_transactions").insert([
        {
          user_id: employee.id,
          amount: initial_tokens,
          transaction_type: "credit",
          description: "Initial token grant",
          balance_after: initial_tokens,
        },
      ])

      if (logError) {
        console.error("Error logging initial transaction:", logError)
      }
    }

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
