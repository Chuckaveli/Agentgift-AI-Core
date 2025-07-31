import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")
    const insightType = searchParams.get("type") || "all"
    const daysBack = Number.parseInt(searchParams.get("daysBack") || "30")

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify admin access
    const { data: admin, error: adminError } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (adminError || !admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const insights = await generateInsights(supabase, insightType, daysBack)

    return NextResponse.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
      period: `${daysBack} days`,
    })
  } catch (error) {
    console.error("Memory vault insights error:", error)
    return NextResponse.json({ error: "Failed to generate insights", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, insightData, action } = body

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify admin access
    const { data: admin, error: adminError } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (adminError || !admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let result = {}

    switch (action) {
      case "save_insight":
        result = await saveInsight(supabase, insightData, adminId)
        break
      case "generate_report":
        result = await generateReport(supabase, insightData, adminId)
        break
      case "detect_anomalies":
        result = await detectAnomalies(supabase, insightData.daysBack || 30)
        break
      case "create_gift_flow":
        result = await createGiftFlow(supabase, insightData, adminId)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      result,
      action,
    })
  } catch (error) {
    console.error("Memory vault insights action error:", error)
    return NextResponse.json({ error: "Failed to execute action", details: error.message }, { status: 500 })
  }
}

async function generateInsights(supabase: any, insightType: string, daysBack: number) {
  const insights = {
    emotional_patterns: [],
    gifting_trends: [],
    user_behavior: [],
    feature_performance: [],
    anomalies: [],
    recommendations: [],
  }

  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - daysBack)

  // Emotional Patterns
  const { data: emotionalData } = await supabase
    .from("context_memory_vault")
    .select("emotional_context, emotional_intensity, logged_at, source")
    .gte("logged_at", dateThreshold.toISOString())

  if (emotionalData) {
    const emotionCounts = {}
    const emotionIntensities = {}

    emotionalData.forEach((item) => {
      const emotion = item.emotional_context
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      if (!emotionIntensities[emotion]) emotionIntensities[emotion] = []
      emotionIntensities[emotion].push(item.emotional_intensity)
    })

    insights.emotional_patterns = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        avgIntensity: emotionIntensities[emotion].reduce((a, b) => a + b, 0) / emotionIntensities[emotion].length,
        trend: calculateTrend(emotionalData.filter((e) => e.emotional_context === emotion)),
      }))
      .sort((a, b) => b.count - a.count)
  }

  // Gifting Trends
  const { data: giftData } = await supabase
    .from("gift_click_logs")
    .select("gift_category, interaction_type, reaction_score, created_at, emotional_context")
    .gte("created_at", dateThreshold.toISOString())

  if (giftData) {
    const categoryPerformance = {}

    giftData.forEach((item) => {
      const category = item.gift_category
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = {
          views: 0,
          clicks: 0,
          saves: 0,
          purchases: 0,
          totalReactionScore: 0,
          count: 0,
        }
      }

      categoryPerformance[category][item.interaction_type] =
        (categoryPerformance[category][item.interaction_type] || 0) + 1
      categoryPerformance[category].totalReactionScore += item.reaction_score || 0
      categoryPerformance[category].count += 1
    })

    insights.gifting_trends = Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        ...data,
        avgReactionScore: data.totalReactionScore / data.count,
        conversionRate: (data.purchases / (data.views || 1)) * 100,
      }))
      .sort((a, b) => b.avgReactionScore - a.avgReactionScore)
  }

  // User Behavior Analysis
  const { data: feedbackData } = await supabase
    .from("user_feedback_logs")
    .select("sentiment, sentiment_score, related_feature, reaction_intensity, created_at")
    .gte("created_at", dateThreshold.toISOString())

  if (feedbackData) {
    const featurePerformance = {}

    feedbackData.forEach((item) => {
      const feature = item.related_feature || "unknown"
      if (!featurePerformance[feature]) {
        featurePerformance[feature] = {
          totalSentiment: 0,
          totalIntensity: 0,
          count: 0,
          sentiments: [],
        }
      }

      featurePerformance[feature].totalSentiment += item.sentiment_score || 0
      featurePerformance[feature].totalIntensity += item.reaction_intensity || 0
      featurePerformance[feature].count += 1
      featurePerformance[feature].sentiments.push(item.sentiment)
    })

    insights.user_behavior = Object.entries(featurePerformance)
      .map(([feature, data]) => ({
        feature,
        avgSentiment: data.totalSentiment / data.count,
        avgIntensity: data.totalIntensity / data.count,
        feedbackCount: data.count,
        topSentiments: [...new Set(data.sentiments)].slice(0, 3),
      }))
      .sort((a, b) => b.avgSentiment - a.avgSentiment)
  }

  // Detect Anomalies
  const { data: anomalies } = await supabase.rpc("detect_emotional_anomalies", {
    p_days_back: daysBack,
  })

  if (anomalies) {
    insights.anomalies = anomalies.slice(0, 10).map((anomaly) => ({
      date: anomaly.anomaly_date,
      emotion: anomaly.emotional_context,
      userCount: anomaly.user_count,
      avgIntensity: anomaly.avg_intensity,
      anomalyScore: anomaly.anomaly_score,
      severity: anomaly.anomaly_score > 3 ? "high" : anomaly.anomaly_score > 2 ? "medium" : "low",
    }))
  }

  // Generate Recommendations
  insights.recommendations = generateRecommendations(insights)

  return insights
}

async function saveInsight(supabase: any, insightData: any, adminId: string) {
  const { data, error } = await supabase
    .from("memory_insights")
    .insert({
      insight_type: insightData.type,
      insight_title: insightData.title,
      insight_description: insightData.description,
      confidence_score: insightData.confidence || 0.8,
      affected_users_count: insightData.userCount || 0,
      time_period_start: insightData.periodStart,
      time_period_end: insightData.periodEnd,
      related_features: insightData.features || [],
      emotional_themes: insightData.emotions || [],
      insight_data: insightData.data || {},
      is_actionable: insightData.actionable || false,
      created_by: adminId,
    })
    .select()
    .single()

  if (error) throw error

  return { insightId: data.id, message: "Insight saved successfully" }
}

async function generateReport(supabase: any, reportData: any, adminId: string) {
  const reportId = `report_${Date.now()}`

  // In a real implementation, this would generate a comprehensive PDF or document
  const report = {
    id: reportId,
    title: reportData.title || "Memory Vault Analysis Report",
    generatedBy: adminId,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "Executive Summary",
        content: reportData.summary || "Comprehensive analysis of user emotional patterns and gifting behaviors.",
      },
      {
        title: "Key Findings",
        content: reportData.findings || [],
      },
      {
        title: "Recommendations",
        content: reportData.recommendations || [],
      },
    ],
    downloadUrl: `/api/admin/memory-vault/reports/${reportId}`,
    format: "PDF",
  }

  return report
}

async function detectAnomalies(supabase: any, daysBack: number) {
  const { data: anomalies, error } = await supabase.rpc("detect_emotional_anomalies", {
    p_days_back: daysBack,
  })

  if (error) throw error

  return {
    anomalies: anomalies || [],
    detectedAt: new Date().toISOString(),
    period: `${daysBack} days`,
    summary: `Detected ${anomalies?.length || 0} emotional anomalies in the specified period.`,
  }
}

async function createGiftFlow(supabase: any, flowData: any, adminId: string) {
  // This would integrate with the gift recommendation system
  const giftFlow = {
    id: `flow_${Date.now()}`,
    name: flowData.name || "Memory-Based Gift Flow",
    basedOnInsight: flowData.insightId,
    emotionalTriggers: flowData.emotions || [],
    targetAudience: flowData.audience || "general",
    recommendations: flowData.recommendations || [],
    createdBy: adminId,
    createdAt: new Date().toISOString(),
    status: "draft",
  }

  return {
    giftFlow,
    message: "Gift flow created successfully based on memory insights",
  }
}

function calculateTrend(data: any[]): string {
  if (data.length < 2) return "stable"

  const sortedData = data.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
  const midPoint = Math.floor(sortedData.length / 2)
  const firstHalf = sortedData.slice(0, midPoint)
  const secondHalf = sortedData.slice(midPoint)

  const firstAvg = firstHalf.reduce((sum, item) => sum + (item.emotional_intensity || 0), 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, item) => sum + (item.emotional_intensity || 0), 0) / secondHalf.length

  const change = ((secondAvg - firstAvg) / firstAvg) * 100

  if (change > 10) return "increasing"
  if (change < -10) return "decreasing"
  return "stable"
}

function generateRecommendations(insights: any): any[] {
  const recommendations = []

  // Emotional pattern recommendations
  if (insights.emotional_patterns.length > 0) {
    const topEmotion = insights.emotional_patterns[0]
    if (topEmotion.emotion === "Anxiety" || topEmotion.emotion === "Stress") {
      recommendations.push({
        type: "emotional_support",
        priority: "high",
        title: "Address Rising Anxiety Patterns",
        description: `${topEmotion.count} instances of ${topEmotion.emotion} detected. Consider implementing calming gift suggestions and stress-relief features.`,
        actionItems: [
          "Activate LUMIENCE™ comfort mode for affected users",
          "Suggest mindfulness and wellness gifts",
          "Implement gentle notification timing",
        ],
      })
    }
  }

  // Gifting trend recommendations
  if (insights.gifting_trends.length > 0) {
    const topCategory = insights.gifting_trends[0]
    if (topCategory.conversionRate < 5) {
      recommendations.push({
        type: "conversion_optimization",
        priority: "medium",
        title: `Improve ${topCategory.category} Gift Conversion`,
        description: `${topCategory.category} has low conversion rate (${topCategory.conversionRate.toFixed(1)}%). Consider better curation or presentation.`,
        actionItems: [
          "Review gift selection criteria",
          "Improve gift presentation and descriptions",
          "Add more personalization options",
        ],
      })
    }
  }

  // Anomaly-based recommendations
  if (insights.anomalies.length > 0) {
    const highSeverityAnomalies = insights.anomalies.filter((a) => a.severity === "high")
    if (highSeverityAnomalies.length > 0) {
      recommendations.push({
        type: "anomaly_investigation",
        priority: "high",
        title: "Investigate Emotional Anomalies",
        description: `${highSeverityAnomalies.length} high-severity emotional anomalies detected. Immediate investigation recommended.`,
        actionItems: [
          "Review system changes during anomaly periods",
          "Check for external factors (holidays, events)",
          "Implement monitoring alerts for similar patterns",
        ],
      })
    }
  }

  return recommendations
}
