import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "weekly"

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "monthly":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "seasonal":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Fetch user signups data
    const { data: userSignups } = await supabase
      .from("user_profiles")
      .select("tier, created_at")
      .gte("created_at", startDate.toISOString())

    // Fetch assistant interactions
    const { data: assistantInteractions } = await supabase
      .from("assistant_interactions")
      .select("*")
      .gte("created_at", startDate.toISOString())

    // Fetch XP transactions
    const { data: xpTransactions } = await supabase
      .from("xp_transactions")
      .select("*")
      .gte("created_at", startDate.toISOString())

    // Fetch feature engagement
    const { data: featureEngagement } = await supabase
      .from("agentgift_features")
      .select("name, usage_count, unique_users")

    // Fetch system health
    const { data: systemHealth } = await supabase
      .from("ecosystem_health")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)

    // Process user signups
    const signupsByTier =
      userSignups?.reduce(
        (acc, user) => {
          acc[user.tier || "free"] = (acc[user.tier || "free"] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Process assistant data
    const assistantStats =
      assistantInteractions?.reduce(
        (acc, interaction) => {
          const assistantId = interaction.assistant_id
          if (!acc[assistantId]) {
            acc[assistantId] = {
              id: assistantId,
              name: interaction.assistant_name || "Unknown",
              usage: 0,
              satisfaction: 0,
              apiCost: 0,
              category: interaction.category || "General",
              satisfactionSum: 0,
              satisfactionCount: 0,
            }
          }
          acc[assistantId].usage += 1
          acc[assistantId].apiCost += interaction.api_cost || 0
          if (interaction.satisfaction_rating) {
            acc[assistantId].satisfactionSum += interaction.satisfaction_rating
            acc[assistantId].satisfactionCount += 1
            acc[assistantId].satisfaction = acc[assistantId].satisfactionSum / acc[assistantId].satisfactionCount
          }
          return acc
        },
        {} as Record<string, any>,
      ) || {}

    // Process XP activity
    const xpByFeature =
      xpTransactions?.reduce(
        (acc, transaction) => {
          const feature = transaction.source_feature || "General"
          acc[feature] = (acc[feature] || 0) + transaction.xp_amount
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Generate usage timeline
    const usageTimeline = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayInteractions =
        assistantInteractions?.filter(
          (interaction) => new Date(interaction.created_at) >= dayStart && new Date(interaction.created_at) <= dayEnd,
        ).length || 0

      const uniqueUsers = new Set(
        assistantInteractions
          ?.filter(
            (interaction) => new Date(interaction.created_at) >= dayStart && new Date(interaction.created_at) <= dayEnd,
          )
          .map((interaction) => interaction.user_id),
      ).size

      usageTimeline.push({
        date: dayStart.toLocaleDateString(),
        interactions: dayInteractions,
        uniqueUsers,
      })
    }

    // Generate recent events
    const recentEvents = [
      {
        id: "1",
        type: "user_signup",
        message: "New Pro+ user registered",
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        user: "user@example.com",
      },
      {
        id: "2",
        type: "assistant_interaction",
        message: "High usage spike on Concierge Core",
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "xp_reward",
        message: 'Badge "Gift Master" earned by 5 users',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        type: "feature_unlock",
        message: "Smart Search™ unlocked by Pro user",
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        type: "system_update",
        message: "Assistant registry synchronized",
        timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      },
    ]

    const reportsData = {
      summary: {
        headline: `${range.charAt(0).toUpperCase() + range.slice(1)} performance shows strong engagement across all tiers`,
        totalUsers: Object.values(signupsByTier).reduce((sum, count) => sum + count, 0),
        activeAssistants: Object.keys(assistantStats).length,
        xpDistributed: Object.values(xpByFeature).reduce((sum, xp) => sum + xp, 0),
        systemHealth: systemHealth?.[0]?.health_score || 98,
      },
      userSignups: {
        total: Object.values(signupsByTier).reduce((sum, count) => sum + count, 0),
        free: signupsByTier.free || 0,
        pro: signupsByTier.pro || 0,
        proPlus: signupsByTier["pro+"] || 0,
        enterprise: signupsByTier.enterprise || 0,
        growth: 15.2, // Mock growth percentage
      },
      topAssistants: Object.values(assistantStats)
        .sort((a: any, b: any) => b.usage - a.usage)
        .slice(0, 10),
      featureEngagement:
        featureEngagement?.map((feature) => ({
          name: feature.name,
          clicks: feature.usage_count || 0,
          uniqueUsers: feature.unique_users || 0,
          conversionRate: Math.random() * 100, // Mock conversion rate
        })) || [],
      xpActivity: {
        badgesEarned: xpTransactions?.filter((t) => t.transaction_type === "badge_earned").length || 0,
        xpSpent:
          xpTransactions
            ?.filter((t) => t.transaction_type === "spent")
            .reduce((sum, t) => sum + Math.abs(t.xp_amount), 0) || 0,
        unlocksTriggered: xpTransactions?.filter((t) => t.transaction_type === "unlock").length || 0,
        distribution: Object.entries(xpByFeature).map(([feature, xp], index) => ({
          feature,
          xp,
          color: ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"][index % 6],
        })),
      },
      systemAlerts: [
        {
          id: "1",
          type: "warning" as const,
          message: "API rate limit approaching for ElevenLabs",
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
      ],
      assistantUsage: usageTimeline,
      recentEvents,
    }

    return NextResponse.json(reportsData)
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json({ error: "Failed to fetch reports data" }, { status: 500 })
  }
}
