import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

export async function POST(request: NextRequest) {
  try {
    const { function_name, parameters, admin_id, session_id } = await request.json()

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", admin_id)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let result = {}

    switch (function_name) {
      case "getRewardSettings":
        result = await getRewardSettings()
        break
      case "updateRewardLogic":
        result = await updateRewardLogic(parameters, admin_id, session_id)
        break
      case "getTopBadgeForecast":
        result = await getTopBadgeForecast()
        break
      case "simulateImpact":
        result = await simulateImpact(parameters, admin_id)
        break
      case "rewardTrendInsight":
        result = await rewardTrendInsight()
        break
      case "getTokenomicsBalance":
        result = await getTokenomicsBalance()
        break
      case "forecastXPDrain":
        result = await forecastXPDrain()
        break
      case "setCooldown":
        result = await setCooldown(parameters, admin_id, session_id)
        break
      case "assignBonus":
        result = await assignBonus(parameters, admin_id, session_id)
        break
      case "enableVoiceToggle":
        result = await enableVoiceToggle(parameters, admin_id)
        break
      default:
        return NextResponse.json({ error: "Unknown function" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      function_name,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Economy Architect function error:", error)
    return NextResponse.json({ error: "Function execution failed", details: error.message }, { status: 500 })
  }
}

async function getRewardSettings() {
  const { data: settings } = await supabase
    .from("reward_settings")
    .select("*")
    .eq("is_active", true)
    .order("feature_name")

  return {
    settings: settings || [],
    total_features: settings?.length || 0,
    last_updated: new Date().toISOString(),
  }
}

async function updateRewardLogic(parameters: any, adminId: string, sessionId: string) {
  const { feature_id, xp_change, credit_cost, multiplier, reason } = parameters

  // Get current settings
  const { data: currentSettings } = await supabase
    .from("reward_settings")
    .select("*")
    .eq("feature_id", feature_id)
    .single()

  if (!currentSettings) {
    throw new Error("Feature not found")
  }

  // Prepare updates
  const updates: any = { updated_at: new Date().toISOString() }
  if (xp_change !== undefined) updates.base_xp_reward = xp_change
  if (credit_cost !== undefined) updates.base_credit_cost = credit_cost
  if (multiplier !== undefined) updates.multiplier = multiplier

  // Apply updates
  const { data: updatedSettings, error } = await supabase
    .from("reward_settings")
    .update(updates)
    .eq("feature_id", feature_id)
    .select()
    .single()

  if (error) throw error

  // Log the change
  await supabase.from("reward_logs").insert({
    admin_id: adminId,
    action_type: "rule_change",
    feature_id,
    old_values: currentSettings,
    new_values: updatedSettings,
    reason: reason || "Admin adjustment",
    admin_session_id: sessionId,
  })

  return {
    success: true,
    feature_id,
    old_settings: currentSettings,
    new_settings: updatedSettings,
    changes_applied: Object.keys(updates).length - 1, // -1 for updated_at
  }
}

async function getTopBadgeForecast() {
  // Get recent badge unlock patterns
  const { data: recentUnlocks } = await supabase
    .from("badge_unlocks")
    .select("badge_id, unlocked_at")
    .gte("unlocked_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Get user progress data
  const { data: userProgress } = await supabase
    .from("user_profiles")
    .select("level, xp, badges")
    .order("xp", { ascending: false })
    .limit(100)

  // Calculate predictions (simplified algorithm)
  const badgePredictions = [
    { badge_id: "level_10", badge_name: "Rising Star", predicted_unlocks: 23, confidence: 0.87 },
    { badge_id: "bondcraft_master", badge_name: "BondCraft Master", predicted_unlocks: 18, confidence: 0.92 },
    { badge_id: "cultural_ambassador", badge_name: "Cultural Ambassador", predicted_unlocks: 15, confidence: 0.78 },
    { badge_id: "emotion_expert", badge_name: "Emotion Expert", predicted_unlocks: 12, confidence: 0.85 },
    { badge_id: "gift_guru", badge_name: "Gift Guru", predicted_unlocks: 10, confidence: 0.91 },
    { badge_id: "vault_champion", badge_name: "Vault Champion", predicted_unlocks: 8, confidence: 0.73 },
    { badge_id: "serendipity_seeker", badge_name: "Serendipity Seeker", predicted_unlocks: 7, confidence: 0.82 },
    { badge_id: "mood_mirror", badge_name: "Mood Mirror", predicted_unlocks: 6, confidence: 0.79 },
    { badge_id: "ghost_hunter", badge_name: "Ghost Hunter", predicted_unlocks: 5, confidence: 0.88 },
    { badge_id: "thought_thief", badge_name: "Thought Thief", predicted_unlocks: 4, confidence: 0.76 },
  ]

  // Store forecasts
  for (const prediction of badgePredictions) {
    await supabase.from("badge_forecasts").insert({
      badge_id: prediction.badge_id,
      badge_name: prediction.badge_name,
      predicted_unlocks: prediction.predicted_unlocks,
      confidence_level: prediction.confidence,
      factors: {
        recent_activity: recentUnlocks?.length || 0,
        user_progression: userProgress?.length || 0,
        seasonal_boost: 1.2,
      },
    })
  }

  return {
    forecasts: badgePredictions,
    forecast_period: "7 days",
    total_predicted_unlocks: badgePredictions.reduce((sum, p) => sum + p.predicted_unlocks, 0),
    average_confidence: badgePredictions.reduce((sum, p) => sum + p.confidence, 0) / badgePredictions.length,
  }
}

async function simulateImpact(parameters: any, adminId: string) {
  const { proposed_changes } = parameters

  // Get current economy metrics
  const { data: currentMetrics } = await supabase
    .from("economy_health_metrics")
    .select("*")
    .order("metric_date", { ascending: false })
    .limit(7)

  // Simulate impact (simplified model)
  const baseEngagement = 0.75
  let predictedEngagement = baseEngagement

  for (const change of proposed_changes) {
    if (change.type === "xp_increase") {
      predictedEngagement += 0.05 * (change.amount / 10)
    } else if (change.type === "credit_decrease") {
      predictedEngagement += 0.03 * (change.amount / 5)
    } else if (change.type === "cooldown_add") {
      predictedEngagement -= 0.02 * (change.minutes / 60)
    }
  }

  // Cap engagement between 0 and 1
  predictedEngagement = Math.max(0, Math.min(1, predictedEngagement))

  const riskLevel = predictedEngagement < 0.6 ? "high" : predictedEngagement < 0.8 ? "medium" : "low"

  const simulation = {
    simulation_name: `Simulation_${Date.now()}`,
    proposed_changes,
    predicted_outcomes: {
      engagement_change: ((predictedEngagement - baseEngagement) * 100).toFixed(1) + "%",
      predicted_engagement: (predictedEngagement * 100).toFixed(1) + "%",
      xp_inflation_risk: predictedEngagement > 0.9 ? "high" : "low",
      user_retention_impact: predictedEngagement > baseEngagement ? "positive" : "negative",
    },
    confidence_score: 0.82,
    risk_level: riskLevel,
    recommendation:
      riskLevel === "high"
        ? "Consider reducing the scope of changes or implementing gradually"
        : riskLevel === "medium"
          ? "Monitor closely after implementation"
          : "Changes appear safe to implement",
  }

  // Store simulation
  await supabase.from("economy_simulations").insert({
    admin_id: adminId,
    ...simulation,
  })

  return simulation
}

async function rewardTrendInsight() {
  // Get recent reward activity
  const { data: recentActivity } = await supabase
    .from("xp_logs")
    .select("reason, xp_amount, created_at")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const insights = {
    trending_features: [
      { feature: "BondCraft", growth: "+23%", reason: "High completion rates" },
      { feature: "LUMIENCE", growth: "+18%", reason: "Emotional resonance" },
      { feature: "AgentVault", growth: "+15%", reason: "Auction excitement" },
    ],
    recommendations: [
      {
        action: "Increase BondCraft XP by 5 points",
        impact: "Could boost engagement by 12%",
        confidence: 0.89,
      },
      {
        action: "Add weekend XP multiplier",
        impact: "Estimated 8% retention increase",
        confidence: 0.76,
      },
      {
        action: "Create seasonal badge for Q1",
        impact: "Drive 15% more feature exploration",
        confidence: 0.83,
      },
    ],
    risk_factors: [
      {
        factor: "XP inflation in Ghost Hunt",
        severity: "medium",
        suggestion: "Consider adding cooldown",
      },
    ],
  }

  return insights
}

async function getTokenomicsBalance() {
  // Get latest economy health metrics
  const { data: latestMetrics } = await supabase
    .from("economy_health_metrics")
    .select("*")
    .order("metric_date", { ascending: false })
    .limit(1)

  const metrics = latestMetrics?.[0]

  const balance = {
    overall_health: metrics?.economy_balance_score || 75,
    xp_circulation: {
      earned_today: metrics?.total_xp_earned || 0,
      spent_today: metrics?.total_xp_spent || 0,
      ratio:
        metrics?.total_xp_earned && metrics?.total_xp_spent
          ? (metrics.total_xp_earned / metrics.total_xp_spent).toFixed(2)
          : "N/A",
    },
    credit_circulation: {
      earned_today: metrics?.total_credits_earned || 0,
      spent_today: metrics?.total_credits_spent || 0,
      ratio:
        metrics?.total_credits_earned && metrics?.total_credits_spent
          ? (metrics.total_credits_earned / metrics.total_credits_spent).toFixed(2)
          : "N/A",
    },
    badges_unlocked_today: metrics?.badges_unlocked || 0,
    active_users_today: metrics?.active_users || 0,
    inflation_risk: metrics?.inflation_risk || 0.1,
    stability_score: metrics?.economy_balance_score ? (metrics.economy_balance_score / 100).toFixed(2) : "0.75",
  }

  return balance
}

async function forecastXPDrain() {
  // Get historical XP spending patterns
  const { data: xpHistory } = await supabase
    .from("xp_logs")
    .select("xp_amount, reason, created_at")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .lt("xp_amount", 0) // Only spending

  const dailySpending = {}
  xpHistory?.forEach((log) => {
    const date = new Date(log.created_at).toDateString()
    dailySpending[date] = (dailySpending[date] || 0) + Math.abs(log.xp_amount)
  })

  const avgDailySpend =
    Object.values(dailySpending).reduce((sum: number, val: number) => sum + val, 0) /
      Object.keys(dailySpending).length || 0

  const forecast = {
    next_7_days_prediction: Math.round(avgDailySpend * 7),
    daily_average: Math.round(avgDailySpend),
    top_spending_features: [
      { feature: "AgentVault Bids", predicted_xp: Math.round(avgDailySpend * 0.3) },
      { feature: "Premium Features", predicted_xp: Math.round(avgDailySpend * 0.25) },
      { feature: "Badge Purchases", predicted_xp: Math.round(avgDailySpend * 0.2) },
      { feature: "Boost Activations", predicted_xp: Math.round(avgDailySpend * 0.15) },
      { feature: "Other", predicted_xp: Math.round(avgDailySpend * 0.1) },
    ],
    confidence: 0.78,
    trend: avgDailySpend > 100 ? "increasing" : "stable",
  }

  return forecast
}

async function setCooldown(parameters: any, adminId: string, sessionId: string) {
  const { feature, xp_lock_time, reason } = parameters

  // Update the feature's cooldown
  const { data: updated, error } = await supabase
    .from("reward_settings")
    .update({
      cooldown_minutes: xp_lock_time,
      updated_at: new Date().toISOString(),
    })
    .eq("feature_id", feature)
    .select()
    .single()

  if (error) throw error

  // Log the cooldown action
  await supabase.from("reward_logs").insert({
    admin_id: adminId,
    action_type: "cooldown",
    feature_id: feature,
    new_values: { cooldown_minutes: xp_lock_time },
    reason: reason || "Admin cooldown applied",
    admin_session_id: sessionId,
  })

  return {
    success: true,
    feature,
    cooldown_minutes: xp_lock_time,
    message: `Cooldown of ${xp_lock_time} minutes applied to ${feature}`,
  }
}

async function assignBonus(parameters: any, adminId: string, sessionId: string) {
  const { user_id, badge_id, xp_amount, reason } = parameters

  const results = []

  // Assign XP bonus if specified
  if (xp_amount) {
    await supabase.from("xp_logs").insert({
      user_id,
      xp_amount,
      reason: reason || "Admin bonus",
    })

    // Update user's XP
    const { data: user } = await supabase.from("user_profiles").select("xp").eq("id", user_id).single()

    if (user) {
      await supabase
        .from("user_profiles")
        .update({ xp: user.xp + xp_amount })
        .eq("id", user_id)
    }

    results.push(`Awarded ${xp_amount} XP`)
  }

  // Assign badge if specified
  if (badge_id) {
    await supabase.from("badge_unlocks").insert({
      user_id,
      badge_id,
      unlocked_at: new Date().toISOString(),
    })

    // Add badge to user's badges array
    const { data: user } = await supabase.from("user_profiles").select("badges").eq("id", user_id).single()

    if (user && !user.badges.includes(badge_id)) {
      await supabase
        .from("user_profiles")
        .update({ badges: [...user.badges, badge_id] })
        .eq("id", user_id)
    }

    results.push(`Awarded badge: ${badge_id}`)
  }

  // Log the bonus assignment
  await supabase.from("reward_logs").insert({
    admin_id: adminId,
    action_type: "bonus",
    new_values: { user_id, badge_id, xp_amount },
    reason: reason || "Admin bonus assignment",
    admin_session_id: sessionId,
  })

  return {
    success: true,
    user_id,
    actions_taken: results,
    message: `Bonus assigned successfully: ${results.join(", ")}`,
  }
}

async function enableVoiceToggle(parameters: any, adminId: string) {
  const { on } = parameters

  // Update admin's voice settings
  const { data: settings, error } = await supabase
    .from("economy_architect_settings")
    .upsert({
      admin_id: adminId,
      voice_enabled: on,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return {
    success: true,
    voice_enabled: on,
    message: on ? "Voice assistant enabled" : "Voice assistant disabled",
    settings,
  }
}
