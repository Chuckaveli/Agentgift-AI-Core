import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { withAuth } from "@/lib/middleware/withAuth"

const supabase = createAdminClient()

export const POST = withAuth(async (request: NextRequest, context) => {
  try {
    const { function: functionName, parameters, session_id, admin_id } = await request.json()

    // Verify admin access
    if (!context.user || !context.user.tier.includes("admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let result = null
    let voiceResponse = ""

    switch (functionName) {
      case "update_assistant_brain":
        result = await updateAssistantBrain(parameters.bot_name, parameters.new_logic, context.user.id)
        voiceResponse = `The neural pathways of ${parameters.bot_name} have been rewoven with new intelligence, Agent. The assistant's consciousness now flows with enhanced wisdom.`
        break

      case "log_feature_usage_summary":
        result = await getFeatureUsageSummary()
        voiceResponse = `The platform's vital signs reveal ${result.total_features} features dancing in harmony, with ${result.xp_total} experience points flowing through our digital veins.`
        break

      case "trigger_reward_test":
        result = await triggerRewardTest(parameters.user_id, parameters.feature, parameters.xp, context.user.id)
        voiceResponse = `The reward simulation cascades through the system, Agent. User ${parameters.user_id} receives ${parameters.xp} XP for their ${parameters.feature} journey.`
        break

      case "voice_ai_query":
        result = await processVoiceAIQuery(parameters.query || parameters.audioData, context.user.id)
        voiceResponse = result.reply_text
        break

      case "get_emotional_summary":
        result = await getEmotionalSummary()
        voiceResponse = `The emotional tapestry weaves with ${result.top_mood} as the dominant thread, painting our platform with ${result.total_interactions} heartfelt interactions.`
        break

      default:
        return NextResponse.json({ error: "Unknown function" }, { status: 400 })
    }

    // Log the function execution
    await supabase.from("admin_action_logs").insert({
      admin_id: context.user.id,
      session_id,
      action_type: `giftverse_leader_${functionName}`,
      action_detail: `Executed ${functionName} with parameters: ${JSON.stringify(parameters)}`,
      request_data: parameters,
      response_data: result,
      execution_status: "success",
      execution_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      function: functionName,
      result,
      voice_response: voiceResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Giftverse Leader intelligence error:", error)

    // Log error
    await supabase.from("admin_action_logs").insert({
      admin_id: context.user?.id,
      session_id: request.headers.get("x-session-id"),
      action_type: "giftverse_leader_error",
      action_detail: error.message,
      execution_status: "error",
      execution_time_ms: Date.now(),
    })

    return NextResponse.json({ error: "Intelligence function failed", details: error.message }, { status: 500 })
  }
})

async function updateAssistantBrain(botName: string, newLogic: string, adminId: string) {
  // Check if admin has founder permissions for voice updates
  const { data: admin } = await supabase.from("user_profiles").select("admin_role").eq("id", adminId).single()

  if (admin?.admin_role !== "founder") {
    throw new Error("Voice assistant logic updates require founder access")
  }

  // Update assistant brain logic
  const { error } = await supabase.from("assistant_brain_updates").insert({
    bot_name: botName,
    logic_update: newLogic,
    updated_by: adminId,
    version: `v${Date.now()}`,
    is_active: true,
  })

  if (error) throw error

  // Deactivate previous versions
  await supabase
    .from("assistant_brain_updates")
    .update({ is_active: false })
    .eq("bot_name", botName)
    .neq("updated_by", adminId)

  return {
    bot_name: botName,
    logic_updated: true,
    version: `v${Date.now()}`,
    updated_by: adminId,
  }
}

async function getFeatureUsageSummary() {
  // Get total features used today
  const { data: featureUsage } = await supabase
    .from("feature_usage_logs")
    .select("feature_name, user_id")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const totalFeatures = new Set(featureUsage?.map((f) => f.feature_name)).size

  // Get top 3 features
  const featureCounts = {}
  featureUsage?.forEach((f) => {
    featureCounts[f.feature_name] = (featureCounts[f.feature_name] || 0) + 1
  })

  const topFeatures = Object.entries(featureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }))

  // Get total XP distributed today
  const { data: xpLogs } = await supabase
    .from("xp_logs")
    .select("xp_amount")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const xpTotal = xpLogs?.reduce((sum, log) => sum + log.xp_amount, 0) || 0

  return {
    total_features: totalFeatures,
    top_features: topFeatures,
    xp_total: xpTotal,
  }
}

async function triggerRewardTest(userId: string, featureName: string, xpAmount: number, adminId: string) {
  // Simulate feature usage
  const { error: usageError } = await supabase.from("feature_usage_logs").insert({
    user_id: userId,
    feature_name: featureName,
    usage_duration: 30, // Simulated 30 seconds
    success_rate: 100,
    admin_simulated: true,
    simulated_by: adminId,
  })

  if (usageError) throw usageError

  // Award XP
  const { data: user } = await supabase.from("user_profiles").select("xp, level").eq("id", userId).single()

  if (!user) throw new Error("User not found")

  const newXP = user.xp + xpAmount
  const newLevel = Math.floor(newXP / 150) + 1

  const { error: xpError } = await supabase
    .from("user_profiles")
    .update({
      xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (xpError) throw xpError

  // Log XP award
  await supabase.from("xp_logs").insert({
    user_id: userId,
    xp_amount: xpAmount,
    reason: `Admin reward test: ${featureName}`,
    admin_id: adminId,
  })

  return {
    user_id: userId,
    feature_tested: featureName,
    xp_awarded: xpAmount,
    new_xp_total: newXP,
    new_level: newLevel,
    test_timestamp: new Date().toISOString(),
  }
}

async function processVoiceAIQuery(query: string, adminId: string) {
  // Process the query with Galen's strategic intelligence
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("platform health") || lowerQuery.includes("system status")) {
    const health = await getSystemHealth()
    return {
      reply_text: `The Giftverse pulses with ${health.health_score}% vitality, Agent. ${health.active_users} souls actively engage while ${health.total_xp} experience points flow through our digital arteries. The platform's heartbeat remains strong and steady.`,
      query_type: "health_check",
      data: health,
    }
  }

  if (lowerQuery.includes("top users") || lowerQuery.includes("leaderboard")) {
    const leaders = await getTopUsers()
    return {
      reply_text: `The champions of our realm shine brightly, Agent. ${leaders[0]?.name} leads with ${leaders[0]?.xp} XP, followed by ${leaders[1]?.name} and ${leaders[2]?.name}. Their dedication illuminates the path for others.`,
      query_type: "leaderboard",
      data: leaders,
    }
  }

  if (lowerQuery.includes("emotional") || lowerQuery.includes("mood") || lowerQuery.includes("sentiment")) {
    const emotions = await getEmotionalSummary()
    return {
      reply_text: `The emotional currents flow with ${emotions.top_mood} as the dominant force, Agent. ${emotions.total_interactions} heartfelt interactions weave through our platform, creating a tapestry of human connection and digital empathy.`,
      query_type: "emotional_analysis",
      data: emotions,
    }
  }

  // Default strategic response
  return {
    reply_text: `Your query flows through the Giftverse's neural networks, Agent. While I process the depths of your request, know that every question strengthens our platform's intelligence. How may I serve your strategic vision more precisely?`,
    query_type: "general",
    original_query: query,
  }
}

async function getEmotionalSummary() {
  const { data: emotions } = await supabase
    .from("emotional_tag_logs")
    .select("emotion_tags, intensity_score, created_at")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true })

  const totalInteractions = emotions?.length || 0

  // Calculate emotion distribution
  const emotionCounts = {}
  emotions?.forEach((e) => {
    e.emotion_tags.forEach((tag) => {
      emotionCounts[tag] = (emotionCounts[tag] || 0) + 1
    })
  })

  const topMood = Object.keys(emotionCounts).reduce((a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b), "neutral")

  // Generate trend data for the last 7 days
  const trendData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dayEmotions = emotions?.filter((e) => {
      const emotionDate = new Date(e.created_at)
      return emotionDate.toDateString() === date.toDateString()
    })

    const dayCounts = { joy: 0, gratitude: 0, excitement: 0, love: 0, neutral: 0 }
    dayEmotions?.forEach((e) => {
      e.emotion_tags.forEach((tag) => {
        if (dayCounts[tag] !== undefined) {
          dayCounts[tag]++
        }
      })
    })

    trendData.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...dayCounts,
    })
  }

  return {
    total_interactions: totalInteractions,
    top_mood: topMood,
    emotion_distribution: emotionCounts,
    trend_data: trendData,
  }
}

async function getSystemHealth() {
  const { data: users } = await supabase.from("user_profiles").select("id, last_activity, xp")

  const totalUsers = users?.length || 0
  const activeUsers =
    users?.filter((u) => {
      const lastActivity = new Date(u.last_activity)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return lastActivity > dayAgo
    }).length || 0

  const totalXP = users?.reduce((sum, u) => sum + (u.xp || 0), 0) || 0
  const healthScore = totalUsers > 0 ? Math.min(100, (activeUsers / totalUsers) * 100 + 20) : 0

  return {
    total_users: totalUsers,
    active_users: activeUsers,
    total_xp: totalXP,
    health_score: Math.round(healthScore),
  }
}

async function getTopUsers() {
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, name, email, xp, level")
    .order("xp", { ascending: false })
    .limit(5)

  return users || []
}
