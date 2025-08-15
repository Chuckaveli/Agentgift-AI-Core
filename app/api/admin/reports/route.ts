import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export const dynamic = "force-dynamic"

const supabase = createAdminClient()

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

    // Mock data for comprehensive reports
    const reportsData = {
      summary: {
        headline: `${range.charAt(0).toUpperCase() + range.slice(1)} performance shows strong engagement across all tiers`,
        totalUsers: 1250,
        activeAssistants: 12,
        xpDistributed: 45000,
        systemHealth: 98,
      },
      userSignups: {
        total: 150,
        free: 100,
        pro: 35,
        proPlus: 12,
        enterprise: 3,
        growth: 15.2,
      },
      topAssistants: [
        { id: "1", name: "Gift Concierge", usage: 450, satisfaction: 4.8, apiCost: 125.5, category: "Gifting" },
        { id: "2", name: "Cultural Guide", usage: 320, satisfaction: 4.6, apiCost: 89.25, category: "Culture" },
        { id: "3", name: "Smart Search", usage: 280, satisfaction: 4.7, apiCost: 76.8, category: "Search" },
        { id: "4", name: "Emotion Engine", usage: 245, satisfaction: 4.9, apiCost: 67.2, category: "Analysis" },
        { id: "5", name: "Gift Gut Check", usage: 198, satisfaction: 4.5, apiCost: 54.3, category: "Validation" },
      ],
      featureEngagement: [
        { name: "Gift Suggestions", clicks: 1200, uniqueUsers: 450, conversionRate: 65.2 },
        { name: "Cultural Insights", clicks: 890, uniqueUsers: 320, conversionRate: 58.7 },
        { name: "Smart Search", clicks: 750, uniqueUsers: 280, conversionRate: 72.1 },
        { name: "Emotion Tags", clicks: 620, uniqueUsers: 245, conversionRate: 43.8 },
        { name: "Group Gifting", clicks: 540, uniqueUsers: 198, conversionRate: 51.2 },
      ],
      xpActivity: {
        badgesEarned: 45,
        xpSpent: 12500,
        unlocksTriggered: 28,
        distribution: [
          { feature: "Gifting", xp: 15000, color: "#ec4899" },
          { feature: "Cultural", xp: 12000, color: "#8b5cf6" },
          { feature: "Search", xp: 10000, color: "#06b6d4" },
          { feature: "Social", xp: 8000, color: "#10b981" },
        ],
      },
      systemAlerts: [
        {
          id: "1",
          type: "warning" as const,
          message: "API rate limit approaching for ElevenLabs",
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: "2",
          type: "info" as const,
          message: "New feature deployment successful",
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
      ],
      assistantUsage: [
        { date: "2024-01-01", interactions: 120, uniqueUsers: 45 },
        { date: "2024-01-02", interactions: 135, uniqueUsers: 52 },
        { date: "2024-01-03", interactions: 150, uniqueUsers: 58 },
        { date: "2024-01-04", interactions: 142, uniqueUsers: 55 },
        { date: "2024-01-05", interactions: 168, uniqueUsers: 62 },
        { date: "2024-01-06", interactions: 155, uniqueUsers: 59 },
        { date: "2024-01-07", interactions: 172, uniqueUsers: 65 },
      ],
      recentEvents: [
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
          type: "feature_unlock",
          message: "User unlocked Premium Search features",
          timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        },
      ],
    }

    return NextResponse.json(reportsData)
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json({ error: "Failed to fetch reports data" }, { status: 500 })
  }
}
