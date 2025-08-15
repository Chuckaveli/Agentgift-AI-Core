import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

export async function GET() {
  try {
    // Use the dashboard stats view for efficient analytics
    const { data: stats, error: statsError } = await supabase.from("emotional_dashboard_stats").select("*").single()

    if (statsError) {
      console.error("Error fetching dashboard stats:", statsError)

      // Fallback to manual queries if view doesn't exist
      return await getFallbackAnalytics()
    }

    // Parse JSON fields from the view
    const analytics = {
      emotions_tagged_week: stats.emotions_tagged_week || 0,
      top_emotions: stats.top_emotions || [],
      top_contexts: stats.top_contexts || [],
      processing_accuracy: Math.round(stats.processing_accuracy || 0),
      webhook_success_rate: Math.round(stats.webhook_success_rate || 0),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error in emotional analytics API:", error)
    return await getFallbackAnalytics()
  }
}

async function getFallbackAnalytics() {
  try {
    // Get emotions tagged this week
    const { count: emotionsThisWeek } = await supabase
      .from("emotional_signatures")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get top emotions (last 30 days)
    const { data: emotionData } = await supabase
      .from("emotional_signatures")
      .select("parsed_emotion")
      .gte("timestamp", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const emotionCounts: { [key: string]: number } = {}
    emotionData?.forEach((item) => {
      emotionCounts[item.parsed_emotion] = (emotionCounts[item.parsed_emotion] || 0) + 1
    })

    const topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get top contexts (last 30 days)
    const { data: contextData } = await supabase
      .from("emotional_signatures")
      .select("context_label")
      .gte("timestamp", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const contextCounts: { [key: string]: number } = {}
    contextData?.forEach((item) => {
      contextCounts[item.context_label] = (contextCounts[item.context_label] || 0) + 1
    })

    const topContexts = Object.entries(contextCounts)
      .map(([context, count]) => ({ context, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get processing accuracy (average confidence score)
    const { data: confidenceData } = await supabase
      .from("emotional_signatures")
      .select("confidence_score")
      .gte("timestamp", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const avgConfidence = confidenceData?.length
      ? Math.round(confidenceData.reduce((sum, item) => sum + item.confidence_score, 0) / confidenceData.length)
      : 0

    // Get webhook success rate
    const { count: totalWebhooks } = await supabase
      .from("emotional_signatures")
      .select("*", { count: "exact", head: true })
      .eq("webhook_sent", true)

    const { count: successfulWebhooks } = await supabase
      .from("emotional_signatures")
      .select("*", { count: "exact", head: true })
      .eq("webhook_sent", true)
      .eq("processed", true)

    const webhookSuccessRate = totalWebhooks ? Math.round((successfulWebhooks / totalWebhooks) * 100) : 0

    const analytics = {
      emotions_tagged_week: emotionsThisWeek || 0,
      top_emotions: topEmotions,
      top_contexts: topContexts,
      processing_accuracy: avgConfidence,
      webhook_success_rate: webhookSuccessRate,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error in fallback analytics:", error)

    // Return default values on complete failure
    return NextResponse.json({
      emotions_tagged_week: 0,
      top_emotions: [],
      top_contexts: [],
      processing_accuracy: 0,
      webhook_success_rate: 0,
    })
  }
}

// POST endpoint for manual analytics updates
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "refresh_analytics":
        // Trigger analytics refresh
        const { error } = await supabase.rpc("refresh_emotional_analytics")
        if (error) throw error
        return NextResponse.json({ success: true, message: "Analytics refreshed" })

      case "export_data":
        // Export analytics data
        const { data: exportData, error: exportError } = await supabase
          .from("emotional_signatures")
          .select("*")
          .gte("timestamp", data.start_date)
          .lte("timestamp", data.end_date)

        if (exportError) throw exportError
        return NextResponse.json({ data: exportData })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in emotional analytics POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
