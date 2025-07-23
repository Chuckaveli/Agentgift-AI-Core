import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simulate analytics data - replace with actual Supabase queries
    const mockAnalytics = {
      totalFeatures: 12,
      activeFeatures: 8,
      weeklyUsage: 1247,
      topFeatures: [
        { name: "Agent Gifty™", usage: 342, growth: 15.2 },
        { name: "LUMIENCE™", usage: 289, growth: 8.7 },
        { name: "BondCraft™", usage: 234, growth: 22.1 },
        { name: "Social Proof Verifier", usage: 198, growth: -3.2 },
        { name: "Gift Gut Check", usage: 184, growth: 12.5 }
      ],
      usageByDay: [
        { day: "Mon", usage: 156 },
        { day: "Tue", usage: 189 },
        { day: "Wed", usage: 234 },
        { day: "Thu", usage: 198 },
        { day: "Fri", usage: 267 },
        { day: "Sat", usage: 123 },
        { day: "Sun", usage: 80 }
      ],
      conversionMetrics: {
        trialToUpgrade: 23.4,
        featureAdoption: 67.8,
        userRetention: 89.2
      }
    }

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error('Analytics API Error:', error)
    
    // Return fallback data instead of error
    const fallbackAnalytics = {
      totalFeatures: 0,
      activeFeatures: 0,
      weeklyUsage: 0,
      topFeatures: [],
      usageByDay: [],
      conversionMetrics: {
        trialToUpgrade: 0,
        featureAdoption: 0,
        userRetention: 0
      }
    }

    return NextResponse.json(fallbackAnalytics)
  }
}
