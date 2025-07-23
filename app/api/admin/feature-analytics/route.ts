import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get total features count
    const { count: totalFeatures, error: totalError } = await supabase
      .from("registered_features")
      .select("*", { count: "exact", head: true })

    if (totalError) {
      console.error("Error fetching total features:", totalError)
    }

    // Get active features count
    const { count: activeFeatures, error: activeError } = await supabase
      .from("registered_features")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    if (activeError) {
      console.error("Error fetching active features:", activeError)
    }

    // Get total usage with error handling
    const { data: usageData, error: usageError } = await supabase.from("registered_features").select("usage_count")

    if (usageError) {
      console.error("Error fetching usage data:", usageError)
    }

    const totalUsage =
      usageData?.reduce((sum, feature) => {
        const count = feature.usage_count || 0
        return sum + (typeof count === "number" ? count : 0)
      }, 0) || 0

    // Get top features with error handling
    const { data: topFeatures, error: topError } = await supabase
      .from("registered_features")
      .select("name, usage_count")
      .order("usage_count", { ascending: false })
      .limit(5)

    if (topError) {
      console.error("Error fetching top features:", topError)
    }

    const response = {
      total_features: totalFeatures || 0,
      active_features: activeFeatures || 0,
      total_usage: totalUsage,
      top_features: topFeatures || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in feature analytics API:", error)

    // Return default values on error
    return NextResponse.json({
      total_features: 0,
      active_features: 0,
      total_usage: 0,
      top_features: [],
    })
  }
}
