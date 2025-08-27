import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import { withAdmin } from '@/lib/with-admin';

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function __orig_GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "overview"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = supabase.from("admin_reports").select("*")

    if (reportType !== "overview") {
      query = query.eq("report_type", reportType)
    }

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    const { data: reports, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    // Generate summary statistics
    const summary = {
      totalReports: reports?.length || 0,
      reportTypes: [...new Set(reports?.map((r) => r.report_type) || [])],
      dateRange: {
        earliest: reports?.[reports.length - 1]?.created_at,
        latest: reports?.[0]?.created_at,
      },
    }

    return NextResponse.json({ reports, summary })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function __orig_POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { report_type, title, description, data, filters } = body

    if (!report_type || !title) {
      return NextResponse.json({ error: "Report type and title are required" }, { status: 400 })
    }

    const { data: report, error } = await supabase
      .from("admin_reports")
      .insert([
        {
          report_type,
          title,
          description,
          data,
          filters,
          status: "generated",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating report:", error)
      return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
    }

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const __orig_GET = withAdmin(__orig_GET);
export const GET = withAdmin(__orig_GET);
const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
