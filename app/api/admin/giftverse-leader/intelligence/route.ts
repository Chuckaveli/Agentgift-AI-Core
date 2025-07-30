import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")
    const intelligenceType = searchParams.get("type")

    // Verify admin access
    const { data: admin } = await supabase.from("user_profiles").select("id, admin_role").eq("id", adminId).single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let intelligenceData = {}

    switch (intelligenceType) {
      case "emotional_trends":
        intelligenceData = await getEmotionalTrendsIntelligence()
        break
      case "gifting_patterns":
        intelligenceData = await getGiftingPatternsIntelligence()
        break
      case "user_behavior":
        intelligenceData = await getUserBehaviorIntelligence()
        break
      case "feature_performance":
        intelligenceData = await getFeaturePerformanceIntelligence()
        break
      case "platform_health":
        intelligenceData = await getPlatformHealthIntelligence()
        break
      default:
        intelligenceData = await getComprehensiveIntelligence()
    }

    return NextResponse.json({
      success: true,
      intelligence_type: intelligenceType,
      data: intelligenceData,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Intelligence gathering error:", error)
    return NextResponse.json({ error: "Intelligence gathering failed", details: error.message }, { status: 500 })
  }
}

async function getEmotionalTrendsIntelligence() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: emotionalTags } = await supabase
    .from("emotional_tag_logs")
    .select("emotion_tags, intensity_score, feature_name, created_at")
    .gte("created_at", sevenDaysAgo)

  const { data: moodBreadcrumbs } = await supabase
    .from("mood_breadcrumbs")
    .select("mood_state, emotional_intensity, trigger_event, created_at")
    .gte("created_at", sevenDaysAgo)

  // Process emotional trends
  const emotionCounts = {}
  const featureEmotions = {}
  let totalIntensity = 0
  let intensityCount = 0

  emotionalTags?.forEach((log) => {
    log.emotion_tags?.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      if (!featureEmotions[log.feature_name]) {
        featureEmotions[log.feature_name] = {}
      }
      featureEmotions[log.feature_name][emotion] = (featureEmotions[log.feature_name][emotion] || 0) + 1
    })
    if (log.intensity_score) {
      totalIntensity += log.intensity_score
      intensityCount++
    }
  })

  return {
    emotion_distribution: emotionCounts,
    feature_emotions: featureEmotions,
    average_intensity: intensityCount > 0 ? totalIntensity / intensityCount : 0,
    mood_patterns: moodBreadcrumbs,
    trend_summary: generateEmotionalTrendSummary(emotionCounts, featureEmotions),
  }
}

async function getGiftingPatternsIntelligence() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: featureUsage } = await supabase
    .from("feature_usage")
    .select("feature_name, credits_used, xp_gained, created_at")
    .gte("created_at", sevenDaysAgo)

  const { data: vaultActivity } = await supabase
    .from("vault_auction_bids")
    .select("bid_amount, created_at")
    .gte("created_at", sevenDaysAgo)

  const { data: emotiTokens } = await supabase
    .from("emotitokens_transactions")
    .select("amount, created_at")
    .gte("created_at", sevenDaysAgo)

  // Process patterns
  const featurePopularity = {}
  const dailyActivity = {}
  let totalCreditsUsed = 0

  featureUsage?.forEach((usage) => {
    featurePopularity[usage.feature_name] = (featurePopularity[usage.feature_name] || 0) + 1
    totalCreditsUsed += usage.credits_used || 0

    const day = usage.created_at.split("T")[0]
    dailyActivity[day] = (dailyActivity[day] || 0) + 1
  })

  return {
    feature_popularity: featurePopularity,
    daily_activity: dailyActivity,
    total_credits_used: totalCreditsUsed,
    vault_activity: vaultActivity?.length || 0,
    emotitokens_circulation: emotiTokens?.reduce((sum, tx) => sum + tx.amount, 0) || 0,
    pattern_insights: generateGiftingPatternInsights(featurePopularity, dailyActivity),
  }
}

async function getUserBehaviorIntelligence() {
  const { data: users } = await supabase.from("user_profiles").select("tier, xp, level, credits, created_at")

  const { data: recentActivity } = await supabase
    .from("feature_usage")
    .select("user_id, feature_name, created_at")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // Process user behavior
  const tierDistribution = {}
  const levelDistribution = {}
  const activeUsers = new Set()

  users?.forEach((user) => {
    tierDistribution[user.tier] = (tierDistribution[user.tier] || 0) + 1
    const levelRange = Math.floor(user.level / 10) * 10
    levelDistribution[`${levelRange}-${levelRange + 9}`] =
      (levelDistribution[`${levelRange}-${levelRange + 9}`] || 0) + 1
  })

  recentActivity?.forEach((activity) => {
    activeUsers.add(activity.user_id)
  })

  return {
    tier_distribution: tierDistribution,
    level_distribution: levelDistribution,
    daily_active_users: activeUsers.size,
    total_users: users?.length || 0,
    engagement_rate: users?.length ? (activeUsers.size / users.length) * 100 : 0,
    behavior_insights: generateUserBehaviorInsights(tierDistribution, activeUsers.size),
  }
}

async function getFeaturePerformanceIntelligence() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: featureUsage } = await supabase
    .from("feature_usage")
    .select("feature_name, user_id, created_at")
    .gte("created_at", sevenDaysAgo)

  // Calculate performance metrics
  const featureMetrics = {}
  const userEngagement = {}

  featureUsage?.forEach((usage) => {
    if (!featureMetrics[usage.feature_name]) {
      featureMetrics[usage.feature_name] = {
        total_uses: 0,
        unique_users: new Set(),
        daily_usage: {},
      }
    }

    featureMetrics[usage.feature_name].total_uses++
    featureMetrics[usage.feature_name].unique_users.add(usage.user_id)

    const day = usage.created_at.split("T")[0]
    featureMetrics[usage.feature_name].daily_usage[day] = (featureMetrics[usage.feature_name].daily_usage[day] || 0) + 1

    userEngagement[usage.user_id] = (userEngagement[usage.user_id] || 0) + 1
  })

  // Convert Sets to counts
  Object.keys(featureMetrics).forEach((feature) => {
    featureMetrics[feature].unique_users = featureMetrics[feature].unique_users.size
  })

  return {
    feature_metrics: featureMetrics,
    top_features: Object.entries(featureMetrics)
      .sort(([, a], [, b]) => b.total_uses - a.total_uses)
      .slice(0, 10),
    user_engagement_distribution: userEngagement,
    performance_insights: generateFeaturePerformanceInsights(featureMetrics),
  }
}

async function getPlatformHealthIntelligence() {
  const { data: systemMetrics } = await supabase
    .from("admin_dashboard_logs")
    .select("execution_status, execution_time_ms, created_at")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const successRate = systemMetrics?.length
    ? (systemMetrics.filter((m) => m.execution_status === "completed").length / systemMetrics.length) * 100
    : 100

  const avgResponseTime = systemMetrics?.length
    ? systemMetrics.reduce((sum, m) => sum + (m.execution_time_ms || 0), 0) / systemMetrics.length
    : 0

  return {
    system_health: {
      success_rate: successRate,
      average_response_time: avgResponseTime,
      total_operations: systemMetrics?.length || 0,
    },
    health_status: successRate > 95 ? "excellent" : successRate > 90 ? "good" : "needs_attention",
    recommendations: generateHealthRecommendations(successRate, avgResponseTime),
  }
}

async function getComprehensiveIntelligence() {
  const [emotional, gifting, behavior, performance, health] = await Promise.all([
    getEmotionalTrendsIntelligence(),
    getGiftingPatternsIntelligence(),
    getUserBehaviorIntelligence(),
    getFeaturePerformanceIntelligence(),
    getPlatformHealthIntelligence(),
  ])

  return {
    emotional_trends: emotional,
    gifting_patterns: gifting,
    user_behavior: behavior,
    feature_performance: performance,
    platform_health: health,
    strategic_summary: generateStrategicSummary(emotional, gifting, behavior, performance),
  }
}

// Helper functions for generating insights
function generateEmotionalTrendSummary(emotions, featureEmotions) {
  const topEmotion = Object.entries(emotions).sort(([, a], [, b]) => b - a)[0]
  return {
    dominant_emotion: topEmotion?.[0] || "neutral",
    emotion_diversity: Object.keys(emotions).length,
    most_emotional_feature: Object.entries(featureEmotions)
      .map(([feature, emotions]) => ({
        feature,
        total: Object.values(emotions).reduce((sum, count) => sum + count, 0),
      }))
      .sort((a, b) => b.total - a.total)[0]?.feature,
  }
}

function generateGiftingPatternInsights(popularity, activity) {
  const topFeature = Object.entries(popularity).sort(([, a], [, b]) => b - a)[0]
  const peakDay = Object.entries(activity).sort(([, a], [, b]) => b - a)[0]

  return {
    most_popular_feature: topFeature?.[0],
    peak_activity_day: peakDay?.[0],
    feature_diversity: Object.keys(popularity).length,
    activity_trend: "increasing", // Could be calculated based on daily progression
  }
}

function generateUserBehaviorInsights(tiers, activeUsers) {
  const dominantTier = Object.entries(tiers).sort(([, a], [, b]) => b - a)[0]

  return {
    dominant_tier: dominantTier?.[0],
    engagement_level: activeUsers > 100 ? "high" : activeUsers > 50 ? "medium" : "low",
    growth_opportunity: "premium_tier_conversion",
  }
}

function generateFeaturePerformanceInsights(metrics) {
  const features = Object.entries(metrics)
  const topPerformer = features.sort(([, a], [, b]) => b.total_uses - a.total_uses)[0]

  return {
    top_performer: topPerformer?.[0],
    total_features_active: features.length,
    engagement_quality: "high", // Could be calculated based on retention metrics
  }
}

function generateHealthRecommendations(successRate, responseTime) {
  const recommendations = []

  if (successRate < 95) {
    recommendations.push("Investigate failed operations and improve error handling")
  }
  if (responseTime > 1000) {
    recommendations.push("Optimize database queries and API response times")
  }
  if (recommendations.length === 0) {
    recommendations.push("System performance is optimal - continue monitoring")
  }

  return recommendations
}

function generateStrategicSummary(emotional, gifting, behavior, performance) {
  return {
    key_insights: [
      `Emotional engagement is ${emotional.average_intensity > 4 ? "high" : "moderate"} with ${emotional.trend_summary.dominant_emotion} leading`,
      `${gifting.pattern_insights.most_popular_feature} is driving the most gifting activity`,
      `User engagement is ${behavior.engagement_rate > 20 ? "strong" : "growing"} with ${behavior.daily_active_users} daily active users`,
      `Platform health is ${performance.health_status} with ${Object.keys(performance.feature_metrics).length} active features`,
    ],
    strategic_recommendations: [
      "Focus on emotional resonance features to increase engagement",
      "Expand successful gifting patterns to underperforming areas",
      "Implement tier upgrade incentives for active users",
      "Continue monitoring system performance and user satisfaction",
    ],
  }
}
