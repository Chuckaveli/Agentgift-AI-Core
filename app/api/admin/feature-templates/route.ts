import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAdmin } from '@/lib/with-admin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-key",
)

async function __orig_GET() {
  try {
    // Try to fetch from database, fallback to mock data if table doesn't exist
    const { data: templates, error } = await supabase
      .from("feature_templates")
      .select("*")
      .order("created_at", { ascending: false })

    if (error && error.code === "42P01") {
      // Table doesn't exist, return mock data
      const mockTemplates = [
        {
          id: "gift-finder-template",
          name: "Gift Finder Template",
          description: "Interactive gift discovery with personality matching",
          ui_type: "quiz",
          default_credit_cost: 2,
          default_xp_award: 50,
        },
        {
          id: "care-package-template",
          name: "Care Package Builder",
          description: "Curated care packages for different occasions",
          ui_type: "form",
          default_credit_cost: 3,
          default_xp_award: 75,
        },
        {
          id: "memory-jar-template",
          name: "Memory Jar Creator",
          description: "Digital memory collection and sharing",
          ui_type: "modal",
          default_credit_cost: 1,
          default_xp_award: 25,
        },
      ]

      return NextResponse.json({ templates: mockTemplates })
    }

    if (error) throw error

    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error("Error fetching feature templates:", error)
    return NextResponse.json({ templates: [] })
  }
}

const __orig_GET = withAdmin(__orig_GET);
export const GET = withAdmin(__orig_GET);
/* ADMIN_GUARDED */
