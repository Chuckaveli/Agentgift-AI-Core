import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const dateRange = searchParams.get("dateRange") || "30"
    const personaFilter = searchParams.get("persona")
    const hideTestUsers = searchParams.get("hideTestUsers") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Verify admin access
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (!adminRole) {
      return NextResponse.json({ error: "Restricted access. Visual Giftverse is admin-only." }, { status: 403 })
    }

    // Calculate date range
    const daysAgo = Number.parseInt(dateRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // 1. User XP Overview
    const { data: totalXpData } = await supabase
      .from("user_xp")
      .select("xp_amount")
      .gte("created_at", startDate.toISOString())

    const totalXp = totalXpData?.reduce((sum, record) => sum + record.xp_amount, 0) || 0

    // Top 10 users by XP
    const { data: topUsersXp } = await supabase
      .from("user_xp")
      .select(`
        user_id,
        xp_amount,
        user_profiles!inner(name, email)
      `)
      .gte("created_at", startDate.toISOString())

    const userXpMap = new Map()
    topUsersXp?.forEach((record) => {
      const userId = record.user_id
      const currentXp = userXpMap.get(userId) || { xp: 0, profile: record.user_profiles }
      userXpMap.set(userId, {
        xp: currentXp.xp + record.xp_amount,
        profile: record.user_profiles,
      })
    })

    const topUsers = Array.from(userXpMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.profile?.name || "Unknown User",
        email: data.profile?.email || "",
        totalXp: data.xp,
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 10)

    // Daily XP trend (last 30 days)
    const { data: dailyXpData } = await supabase
      .from("user_xp")
      .select("xp_amount, created_at")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })

    const dailyXpTrend = []
    const dailyMap = new Map()

    dailyXpData?.forEach((record) => {
      const date = new Date(record.created_at).toDateString()
      dailyMap.set(date, (dailyMap.get(date) || 0) + record.xp_amount)
    })

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      dailyXpTrend.push({
        date: dateStr,
        xp: dailyMap.get(dateStr) || 0,
      })
    }

    // 2. Feature Usage Breakdown
    const { data: featureUsageData } = await supabase
      .from("feature_usage_logs")
      .select("feature_name, feature_category, created_at")
      .gte("created_at", startDate.toISOString())

    const featureUsageMap = new Map()
    featureUsageData?.forEach((record) => {
      const feature = record.feature_name
      featureUsageMap.set(feature, (featureUsageMap.get(feature) || 0) + 1)
    })

    const topFeatures = Array.from(featureUsageMap.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Feature usage timeline
    const featureTimelineMap = new Map()
    featureUsageData?.forEach((record) => {
      const date = new Date(record.created_at).toDateString()
      const feature = record.feature_name
      const key = `${date}-${feature}`
      featureTimelineMap.set(key, (featureTimelineMap.get(key) || 0) + 1)
    })

    const featureTimeline = Array.from(featureTimelineMap.entries()).map(([key, count]) => {
      const [date, feature] = key.split("-")
      return { date, feature, count }
    })

    // 3. Gift Interaction Heatmap
    const { data: giftClickData } = await supabase
      .from("gift_click_logs")
      .select("gift_category, gift_subcategory, recipient_persona_type, interaction_type")
      .gte("created_at", startDate.toISOString())

    const giftCategoryMap = new Map()
    giftClickData?.forEach((record) => {
      const category = record.gift_category
      const current = giftCategoryMap.get(category) || {
        clicks: 0,
        personas: new Set(),
        subcategories: new Set(),
      }
      current.clicks += 1
      if (record.recipient_persona_type) current.personas.add(record.recipient_persona_type)
      if (record.gift_subcategory) current.subcategories.add(record.gift_subcategory)
      giftCategoryMap.set(category, current)
    })

    const giftHeatmap = Array.from(giftCategoryMap.entries()).map(([category, data]) => ({
      category,
      clicks: data.clicks,
      personas: Array.from(data.personas),
      subcategories: Array.from(data.subcategories),
    }))

    // 4. Emotional Trends Feed
    const { data: emotionalData } = await supabase
      .from("emotional_tag_logs")
      .select("emotion_category, emotion_intensity, trigger_feature, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    const emotionTrendsMap = new Map()
    const recentEmotions = emotionalData?.slice(0, 20) || []

    emotionalData?.forEach((record) => {
      const emotion = record.emotion_category
      const current = emotionTrendsMap.get(emotion) || {
        count: 0,
        totalIntensity: 0,
        avgIntensity: 0,
        trend: 0,
      }
      current.count += 1
      current.totalIntensity += record.emotion_intensity
      current.avgIntensity = current.totalIntensity / current.count
      emotionTrendsMap.set(emotion, current)
    })

    // Calculate trends (simplified - comparing first half vs second half of period)
    const midPoint = new Date(startDate.getTime() + (Date.now() - startDate.getTime()) / 2)

    emotionTrendsMap.forEach((data, emotion) => {
      const recentCount =
        emotionalData?.filter((record) => record.emotion_category === emotion && new Date(record.created_at) > midPoint)
          .length || 0

      const olderCount =
        emotionalData?.filter(
          (record) => record.emotion_category === emotion && new Date(record.created_at) <= midPoint,
        ).length || 0

      data.trend = recentCount - olderCount
    })

    const emotionalTrends = Array.from(emotionTrendsMap.entries()).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      avgIntensity: Math.round(data.avgIntensity * 100) / 100,
      trend: data.trend,
    }))

    // 5. Voice Assistant Engagement
    const { data: voiceSessionData } = await supabase
      .from("voice_session_logs")
      .select("voice_name, session_duration_seconds, interaction_count")
      .gte("created_at", startDate.toISOString())

    const voiceEngagementMap = new Map()
    let totalVoiceSessions = 0

    voiceSessionData?.forEach((record) => {
      const voice = record.voice_name
      const current = voiceEngagementMap.get(voice) || {
        sessions: 0,
        totalDuration: 0,
        totalInteractions: 0,
      }
      current.sessions += 1
      current.totalDuration += record.session_duration_seconds || 0
      current.totalInteractions += record.interaction_count || 0
      voiceEngagementMap.set(voice, current)
      totalVoiceSessions += 1
    })

    const voiceEngagement = Array.from(voiceEngagementMap.entries()).map(([voice, data]) => ({
      voice,
      sessions: data.sessions,
      percentage: Math.round((data.sessions / totalVoiceSessions) * 100),
      avgDuration: Math.round(data.totalDuration / data.sessions),
      avgInteractions: Math.round(data.totalInteractions / data.sessions),
    }))

    // Compile analytics response
    const analytics = {
      userXpOverview: {
        totalXp,
        topUsers,
        dailyTrend: dailyXpTrend,
      },
      featureUsage: {
        topFeatures,
        timeline: featureTimeline,
      },
      giftInteractions: {
        heatmap: giftHeatmap,
      },
      emotionalTrends: {
        recent: recentEmotions,
        trends: emotionalTrends,
      },
      voiceEngagement: {
        breakdown: voiceEngagement,
        totalSessions: totalVoiceSessions,
      },
      metadata: {
        dateRange: daysAgo,
        generatedAt: new Date().toISOString(),
        totalRecords: {
          xp: totalXpData?.length || 0,
          features: featureUsageData?.length || 0,
          gifts: giftClickData?.length || 0,
          emotions: emotionalData?.length || 0,
          voice: voiceSessionData?.length || 0,
        },
      },
    }

    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error("Visual analytics error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate analytics",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, data } = await request.json()

    // Verify admin access
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (!adminRole) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    switch (action) {
      case "export_snapshot":
        // Generate export data
        const exportData = {
          exportId: `giftverse_export_${Date.now()}`,
          timestamp: new Date().toISOString(),
          watermark: "AgentGift Leader Export",
          data: data,
          exportedBy: userId,
        }

        return NextResponse.json({
          success: true,
          exportData,
          downloadUrl: `/api/admin/visual-analytics/export?id=${exportData.exportId}`,
        })

      case "voice_summary":
        // Generate voice summary based on current data
        const summary = generateVoiceSummary(data)
        return NextResponse.json({ success: true, summary })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Visual analytics POST error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function generateVoiceSummary(analyticsData: any): string {
  const { userXpOverview, emotionalTrends, featureUsage, voiceEngagement } = analyticsData

  let summary = "Here's your Giftverse intelligence summary: "

  // XP insights
  if (userXpOverview?.totalXp) {
    summary += `Total XP earned is ${userXpOverview.totalXp.toLocaleString()} points. `
    if (userXpOverview.topUsers?.length > 0) {
      summary += `Top performer is ${userXpOverview.topUsers[0].name} with ${userXpOverview.topUsers[0].totalXp} XP. `
    }
  }

  // Emotional trends
  if (emotionalTrends?.trends?.length > 0) {
    const topEmotion = emotionalTrends.trends[0]
    const trendDirection = topEmotion.trend > 0 ? "increased" : "decreased"
    summary += `Emotional activity shows ${topEmotion.emotion} has ${trendDirection}. `
  }

  // Feature usage
  if (featureUsage?.topFeatures?.length > 0) {
    const topFeature = featureUsage.topFeatures[0]
    summary += `Most popular feature is ${topFeature.feature} with ${topFeature.count} uses. `
  }

  // Voice engagement
  if (voiceEngagement?.breakdown?.length > 0) {
    const topVoice = voiceEngagement.breakdown[0]
    summary += `${topVoice.voice} is the preferred voice assistant with ${topVoice.percentage}% usage. `
  }

  summary += "Would you like me to export this data or drill down into specific metrics?"

  return summary
}
