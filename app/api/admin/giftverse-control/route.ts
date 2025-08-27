import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAuth } from "@/lib/middleware/withAuth"
import { withAdmin } from '@/lib/with-admin';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const __orig_POST = withAuth(async (request: NextRequest, context) => {
  try {
    const { action, parameters, target_user_id, session_id } = await request.json()

    // Verify admin access
    if (!context.user || !context.user.tier.includes("admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let result = null
    let actionDetail = ""

    switch (action) {
      case "adjust_user_xp":
        result = await adjustUserXP(parameters.user_id, parameters.xp_change, parameters.reason, context.user.id)
        actionDetail = `Adjusted XP by ${parameters.xp_change} for user ${parameters.user_id}`
        break

      case "adjust_user_credits":
        result = await adjustUserCredits(
          parameters.user_id,
          parameters.credit_change,
          parameters.reason,
          context.user.id,
        )
        actionDetail = `Adjusted credits by ${parameters.credit_change} for user ${parameters.user_id}`
        break

      case "assign_badge":
        result = await assignBadge(parameters.user_id, parameters.badge_id, parameters.reason, context.user.id)
        actionDetail = `Assigned badge ${parameters.badge_id} to user ${parameters.user_id}`
        break

      case "ban_user_from_feature":
        result = await banUserFromFeature(
          parameters.user_id,
          parameters.feature_name,
          parameters.duration_hours,
          parameters.reason,
          context.user.id,
        )
        actionDetail = `Banned user ${parameters.user_id} from ${parameters.feature_name} for ${parameters.duration_hours} hours`
        break

      case "trigger_announcement":
        result = await triggerAnnouncement(
          parameters.message,
          parameters.target_audience,
          parameters.priority,
          context.user.id,
        )
        actionDetail = `Triggered announcement: ${parameters.message.substring(0, 50)}...`
        break

      case "simulate_edge_case":
        result = await simulateEdgeCase(parameters.event_type, parameters.event_data, context.user.id)
        actionDetail = `Simulated edge case: ${parameters.event_type}`
        break

      case "get_emotional_logs":
        result = await getEmotionalLogs(parameters.filters, parameters.limit || 100)
        actionDetail = "Retrieved emotional intelligence logs"
        break

      case "get_feature_usage_logs":
        result = await getFeatureUsageLogs(parameters.filters, parameters.limit || 100)
        actionDetail = "Retrieved feature usage logs"
        break

      case "get_user_breakdown":
        result = await getUserBreakdown(parameters.user_id)
        actionDetail = `Retrieved breakdown for user ${parameters.user_id}`
        break

      case "export_giftverse_health":
        result = await exportGiftverseHealth(context.user.id)
        actionDetail = "Exported Giftverse health snapshot"
        break

      case "start_impersonation":
        result = await startUserImpersonation(parameters.user_id, parameters.reason, context.user.id)
        actionDetail = `Started impersonating user ${parameters.user_id}`
        break

      case "end_impersonation":
        result = await endUserImpersonation(parameters.impersonation_id, context.user.id)
        actionDetail = `Ended impersonation session ${parameters.impersonation_id}`
        break

      case "grant_5xp_bonus":
        result = await grant5XPBonus(parameters.user_id, parameters.reason, context.user.id)
        actionDetail = `Granted 5 XP bonus to user ${parameters.user_id}`
        break

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    // Log admin action
    await supabase.from("admin_action_logs").insert({
      admin_id: context.user.id,
      session_id,
      action_type: action,
      action_detail: actionDetail,
      target_user_id,
      request_data: parameters,
      response_data: result,
      execution_status: "success",
      execution_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin control error:", error)

    // Log error
    await supabase.from("admin_action_logs").insert({
      admin_id: context.user?.id,
      session_id: request.headers.get("x-session-id"),
      action_type: "error",
      action_detail: error.message,
      execution_status: "error",
      execution_time_ms: Date.now(),
    })

    return NextResponse.json({ error: "Admin action failed", details: error.message }, { status: 500 })
  }
})

async function adjustUserXP(userId: string, xpChange: number, reason: string, adminId: string) {
  const { data: user, error: fetchError } = await supabase
    .from("user_profiles")
    .select("xp, level")
    .eq("id", userId)
    .single()

  if (fetchError) throw new Error("User not found")

  const newXP = Math.max(0, user.xp + xpChange)
  const newLevel = Math.floor(newXP / 150) + 1

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) throw updateError

  // Log XP change
  await supabase.from("xp_logs").insert({
    user_id: userId,
    xp_amount: xpChange,
    reason: `Admin adjustment: ${reason}`,
    admin_id: adminId,
  })

  return {
    previous_xp: user.xp,
    new_xp: newXP,
    previous_level: user.level,
    new_level: newLevel,
    change: xpChange,
  }
}

async function adjustUserCredits(userId: string, creditChange: number, reason: string, adminId: string) {
  const { data: user, error: fetchError } = await supabase
    .from("user_profiles")
    .select("credits")
    .eq("id", userId)
    .single()

  if (fetchError) throw new Error("User not found")

  const newCredits = Math.max(0, user.credits + creditChange)

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) throw updateError

  // Log credit transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: creditChange,
    reason: `Admin adjustment: ${reason}`,
    balance_after: newCredits,
    admin_id: adminId,
  })

  return {
    previous_credits: user.credits,
    new_credits: newCredits,
    change: creditChange,
  }
}

async function assignBadge(userId: string, badgeId: string, reason: string, adminId: string) {
  // Check if user already has badge
  const { data: existingBadge } = await supabase
    .from("badge_earned_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .single()

  if (existingBadge) {
    throw new Error("User already has this badge")
  }

  // Add badge to user's badges array
  const { data: user } = await supabase.from("user_profiles").select("badges").eq("id", userId).single()

  const updatedBadges = [...(user?.badges || []), badgeId]

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      badges: updatedBadges,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) throw updateError

  // Log badge assignment
  await supabase.from("badge_earned_logs").insert({
    user_id: userId,
    badge_id: badgeId,
    earned_reason: `Admin assignment: ${reason}`,
    admin_assigned: true,
    admin_id: adminId,
  })

  return {
    badge_id: badgeId,
    assigned_to: userId,
    reason,
    total_badges: updatedBadges.length,
  }
}

async function banUserFromFeature(
  userId: string,
  featureName: string,
  durationHours: number,
  reason: string,
  adminId: string,
) {
  const banUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000)

  const { error } = await supabase.from("user_feature_bans").insert({
    user_id: userId,
    feature_name: featureName,
    banned_until: banUntil.toISOString(),
    ban_reason: reason,
    banned_by: adminId,
  })

  if (error) throw error

  return {
    user_id: userId,
    feature_name: featureName,
    banned_until: banUntil.toISOString(),
    duration_hours: durationHours,
    reason,
  }
}

async function triggerAnnouncement(message: string, targetAudience: string, priority: string, adminId: string) {
  const { error } = await supabase.from("platform_announcements").insert({
    message,
    target_audience: targetAudience,
    priority,
    created_by: adminId,
    is_active: true,
  })

  if (error) throw error

  return {
    message,
    target_audience: targetAudience,
    priority,
    created_at: new Date().toISOString(),
  }
}

async function simulateEdgeCase(eventType: string, eventData: any, adminId: string) {
  // Log the simulation
  await supabase.from("edge_case_simulations").insert({
    event_type: eventType,
    event_data: eventData,
    simulated_by: adminId,
    simulation_results: { status: "triggered", timestamp: new Date().toISOString() },
  })

  // Trigger different edge cases based on type
  switch (eventType) {
    case "feature_fail":
      return { event: "feature_fail", affected_feature: eventData.feature_name, simulated: true }
    case "emotional_spike":
      return { event: "emotional_spike", emotion: eventData.emotion, intensity: eventData.intensity, simulated: true }
    case "xp_overflow":
      return { event: "xp_overflow", user_id: eventData.user_id, overflow_amount: eventData.amount, simulated: true }
    default:
      return { event: eventType, data: eventData, simulated: true }
  }
}

async function getEmotionalLogs(filters: any, limit: number) {
  let query = supabase
    .from("emotional_tag_logs")
    .select("*, user_profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (filters.emotion_type) {
    query = query.contains("emotion_tags", [filters.emotion_type])
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte("created_at", filters.date_to)
  }

  const { data, error } = await query

  if (error) throw error

  return data
}

async function getFeatureUsageLogs(filters: any, limit: number) {
  let query = supabase
    .from("feature_usage_logs")
    .select("*, user_profiles(name, email, tier)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (filters.feature_name) {
    query = query.eq("feature_name", filters.feature_name)
  }

  if (filters.user_tier) {
    query = query.eq("user_profiles.tier", filters.user_tier)
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from)
  }

  const { data, error } = await query

  if (error) throw error

  return data
}

async function getUserBreakdown(userId: string) {
  const { data: user, error: userError } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (userError) throw userError

  // Get user's XP logs
  const { data: xpLogs } = await supabase
    .from("xp_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's badge logs
  const { data: badgeLogs } = await supabase
    .from("badge_earned_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Get user's feature usage
  const { data: featureUsage } = await supabase
    .from("feature_usage_logs")
    .select("feature_name, COUNT(*) as usage_count")
    .eq("user_id", userId)
    .group("feature_name")

  return {
    user,
    recent_xp_logs: xpLogs,
    badge_logs: badgeLogs,
    feature_usage: featureUsage,
  }
}

async function exportGiftverseHealth(adminId: string) {
  const { data, error } = await supabase.rpc("generate_giftverse_health_snapshot", {
    admin_user_id: adminId,
  })

  if (error) throw error

  return data
}

async function startUserImpersonation(userId: string, reason: string, adminId: string) {
  const { data, error } = await supabase
    .from("user_impersonation_logs")
    .insert({
      admin_id: adminId,
      target_user_id: userId,
      reason,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

async function endUserImpersonation(impersonationId: string, adminId: string) {
  const { error } = await supabase
    .from("user_impersonation_logs")
    .update({
      impersonation_end: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", impersonationId)
    .eq("admin_id", adminId)

  if (error) throw error

  return { impersonation_id: impersonationId, ended_at: new Date().toISOString() }
}

async function grant5XPBonus(userId: string, reason: string, adminId: string) {
  return await adjustUserXP(userId, 5, `5XP Bonus: ${reason}`, adminId)
}

export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
