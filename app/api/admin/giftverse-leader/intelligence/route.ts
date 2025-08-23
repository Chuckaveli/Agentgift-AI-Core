// app/api/admin/giftverse-leader/intelligence/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { withAuth } from "@/lib/middleware/withAuth";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient(): SupabaseClient<Database> {
  if (!URL || !SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { fetch },
  });
}

export const POST = withAuth(async (request: NextRequest, context) => {
  const supabase = getAdminClient();

  try {
    const {
      function: functionName,
      parameters = {},
      session_id,
      admin_id, // optional external id if you pass it
    } = await request.json();

    if (!context.user || !context.user.tier?.includes("admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    let result: unknown = null;
    let voiceResponse = "";

    switch (functionName) {
      case "update_assistant_brain": {
        result = await updateAssistantBrain(
          supabase,
          String(parameters.bot_name),
          String(parameters.new_logic),
          context.user.id
        );
        voiceResponse = `The neural pathways of ${parameters.bot_name} have been rewoven with new intelligence, Agent.`;
        break;
      }

      case "log_feature_usage_summary": {
        const summary = await getFeatureUsageSummary(supabase);
        result = summary;
        voiceResponse = `The platform's vital signs reveal ${summary.total_features} features active, with ${summary.xp_total} XP flowing today.`;
        break;
      }

      case "trigger_reward_test": {
        result = await triggerRewardTest(
          supabase,
          String(parameters.user_id),
          String(parameters.feature),
          Number(parameters.xp),
          context.user.id
        );
        voiceResponse = `Simulated: User ${parameters.user_id} receives ${parameters.xp} XP for ${parameters.feature}.`;
        break;
      }

      case "voice_ai_query": {
        const out = await processVoiceAIQuery(supabase, String(parameters.query ?? parameters.audioData), context.user.id);
        result = out;
        voiceResponse = out.reply_text;
        break;
      }

      case "get_emotional_summary": {
        const emo = await getEmotionalSummary(supabase);
        result = emo;
        voiceResponse = `Dominant mood: ${emo.top_mood}. ${emo.total_interactions} interactions in the last 7 days.`;
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown function" }, { status: 400 });
    }

    await supabase.from("admin_action_logs").insert({
      admin_id: context.user.id,
      session_id: session_id ?? request.headers.get("x-session-id"),
      action_type: `giftverse_leader_${functionName}`,
      action_detail: `Executed ${functionName} with parameters: ${JSON.stringify(parameters)}`,
      request_data: parameters,
      response_data: result,
      execution_status: "success",
      execution_time_ms: Date.now(),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      function: functionName,
      result,
      voice_response: voiceResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // best-effort error log
    try {
      const admin = getAdminClient();
      await admin.from("admin_action_logs").insert({
        admin_id: context.user?.id ?? admin_id ?? null,
        session_id: request.headers.get("x-session-id"),
        action_type: "giftverse_leader_error",
        action_detail: String(error?.message ?? error),
        execution_status: "error",
        execution_time_ms: Date.now(),
        created_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json(
      { error: "Intelligence function failed", details: String(error?.message ?? error) },
      { status: 500 }
    );
  }
});

/* ================= helpers ================= */

async function updateAssistantBrain(
  supabase: SupabaseClient<Database>,
  botName: string,
  newLogic: string,
  adminId: string
) {
  const { data: admin } = await supabase.from("user_profiles").select("admin_role").eq("id", adminId).single();
  if (admin?.admin_role !== "founder") {
    throw new Error("Voice assistant logic updates require founder access");
  }

  const version = `v${Date.now()}`;
  const { error } = await supabase.from("assistant_brain_updates").insert({
    bot_name: botName,
    logic_update: newLogic,
    updated_by: adminId,
    version,
    is_active: true,
  });
  if (error) throw error;

  await supabase
    .from("assistant_brain_updates")
    .update({ is_active: false })
    .eq("bot_name", botName)
    .neq("version", version);

  return { bot_name: botName, logic_updated: true, version, updated_by: adminId };
}

async function getFeatureUsageSummary(supabase: SupabaseClient<Database>) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: featureUsage } = await supabase
    .from("feature_usage_logs")
    .select("feature_name, user_id")
    .gte("created_at", since);

  const totalFeatures = new Set((featureUsage ?? []).map((f) => f.feature_name)).size;

  const counts: Record<string, number> = {};
  (featureUsage ?? []).forEach((f) => {
    counts[f.feature_name] = (counts[f.feature_name] ?? 0) + 1;
  });

  const topFeatures = Object.entries(counts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const { data: xpLogs } = await supabase.from("xp_logs").select("xp_amount").gte("created_at", since);
  const xpTotal = (xpLogs ?? []).reduce((sum, x) => sum + (x.xp_amount ?? 0), 0);

  return { total_features: totalFeatures, top_features: topFeatures, xp_total: xpTotal };
}

async function triggerRewardTest(
  supabase: SupabaseClient<Database>,
  userId: string,
  featureName: string,
  xpAmount: number,
  adminId: string
) {
  const { error: usageError } = await supabase.from("feature_usage_logs").insert({
    user_id: userId,
    feature_name: featureName,
    usage_duration: 30,
    success_rate: 100,
    admin_simulated: true,
    simulated_by: adminId,
  });
  if (usageError) throw usageError;

  const { data: user } = await supabase.from("user_profiles").select("xp, level").eq("id", userId).single();
  if (!user) throw new Error("User not found");

  const newXP = (user.xp ?? 0) + (xpAmount ?? 0);
  const newLevel = Math.floor(newXP / 150) + 1;

  const { error: xpError } = await supabase
    .from("user_profiles")
    .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (xpError) throw xpError;

  await supabase.from("xp_logs").insert({
    user_id: userId,
    xp_amount: xpAmount,
    reason: `Admin reward test: ${featureName}`,
    admin_id: adminId,
  });

  return {
    user_id: userId,
    feature_tested: featureName,
    xp_awarded: xpAmount,
    new_xp_total: newXP,
    new_level: newLevel,
    test_timestamp: new Date().toISOString(),
  };
}

async function processVoiceAIQuery(
  supabase: SupabaseClient<Database>,
  query: string,
  adminId: string
) {
  const q = (query ?? "").toLowerCase();

  if (q.includes("platform health") || q.includes("system status")) {
    const health = await getSystemHealth(supabase);
    return {
      reply_text: `Health ${health.health_score}% • Active ${health.active_users}/${health.total_users} • Total XP ${health.total_xp}.`,
      query_type: "health_check",
      data: health,
    };
  }

  if (q.includes("top users") || q.includes("leaderboard")) {
    const leaders = await getTopUsers(supabase);
    const [a, b, c] = leaders;
    return {
      reply_text: `Top agents: ${a?.name ?? "—"} (${a?.xp ?? 0} XP), ${b?.name ?? "—"} (${b?.xp ?? 0}), ${c?.name ?? "—"} (${c?.xp ?? 0}).`,
      query_type: "leaderboard",
      data: leaders,
    };
  }

  if (q.includes("emotional") || q.includes("mood") || q.includes("sentiment")) {
    const emotions = await getEmotionalSummary(supabase);
    return {
      reply_text: `Dominant mood: ${emotions.top_mood}. ${emotions.total_interactions} interactions this week.`,
      query_type: "emotional_analysis",
      data: emotions,
    };
  }

  return {
    reply_text:
      "Query received. Specify “platform health”, “top users”, or “emotional summary” for focused intelligence.",
    query_type: "general",
    original_query: query,
  };
}

async function getEmotionalSummary(supabase: SupabaseClient<Database>) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: emotions } = await supabase
    .from("emotional_tag_logs")
    .select("emotion_tags, intensity_score, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const items = emotions ?? [];
  const totalInteractions = items.length;

  const emotionCounts: Record<string, number> = {};
  for (const e of items) {
    for (const tag of e.emotion_tags ?? []) {
      emotionCounts[tag] = (emotionCounts[tag] ?? 0) + 1;
    }
  }

  const topMood =
    Object.keys(emotionCounts).reduce(
      (best, k) => ((emotionCounts[k] ?? 0) > (emotionCounts[best] ?? 0) ? k : best),
      Object.keys(emotionCounts)[0] ?? "neutral"
    ) ?? "neutral";

  const trendData: Array<Record<string, number | string>> = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStr = day.toDateString();
    const dayItems = items.filter((e) => new Date(e.created_at).toDateString() === dayStr);

    const dayCounts: Record<string, number> = { joy: 0, gratitude: 0, excitement: 0, love: 0, neutral: 0 };
    for (const e of dayItems) {
      for (const tag of e.emotion_tags ?? []) {
        if (dayCounts[tag] !== undefined) dayCounts[tag] += 1;
      }
    }

    trendData.push({
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...dayCounts,
    });
  }

  return {
    total_interactions: totalInteractions,
    top_mood: topMood,
    emotion_distribution: emotionCounts,
    trend_data: trendData,
  };
}

async function getSystemHealth(supabase: SupabaseClient<Database>) {
  const { data: users } = await supabase.from("user_profiles").select("id, last_activity, xp");
  const list = users ?? [];

  const totalUsers = list.length;
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeUsers = list.filter((u) => (u.last_activity ? new Date(u.last_activity) > dayAgo : false)).length;
  const totalXP = list.reduce((sum, u) => sum + (u.xp ?? 0), 0);
  const healthScore = totalUsers > 0 ? Math.min(100, (activeUsers / totalUsers) * 100 + 20) : 0;

  return {
    total_users: totalUsers,
    active_users: activeUsers,
    total_xp: totalXP,
    health_score: Math.round(healthScore),
  };
}

async function getTopUsers(supabase: SupabaseClient<Database>) {
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, name, email, xp, level")
    .order("xp", { ascending: false })
    .limit(5);
  return users ?? [];
}
