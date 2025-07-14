import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get total features count
    const { count: totalFeatures } = await supabase
      .from("registered_features")
      .select("*", { count: "exact", head: true })

    // Get active features count
    const { count: activeFeatures } = await supabase
      .from("registered_features")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get total usage
    const { data: usageData } = await supabase.from("registered_features").select("usage_count")

    const totalUsage = usageData?.reduce((sum, feature) => sum + (feature.usage_count || 0), 0) || 0

    // Get top features
    const { data: topFeatures } = await supabase
      .from("registered_features")
      .select("name, usage_count")
      .order("usage_count", { ascending: false })
      .limit(5)

    return NextResponse.json({
      total_features: totalFeatures || 0,
      active_features: activeFeatures || 0,
      total_usage: totalUsage,
      top_features: topFeatures || [],
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
