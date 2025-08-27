import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { withAdmin } from '@/lib/with-admin';

async function __orig_POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, searchType = "natural_language", filters = {}, adminId, isVoiceQuery = false, limit = 50 } = body

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

    const startTime = Date.now()
    let results = []
    let totalCount = 0

    // Parse natural language query
    const queryIntent = parseQueryIntent(query)

    // Execute search based on type
    switch (searchType) {
      case "natural_language":
        results = await executeNaturalLanguageSearch(supabase, query, filters, limit)
        break
      case "semantic":
        results = await executeSemanticSearch(supabase, query, filters, limit)
        break
      case "filter":
        results = await executeFilterSearch(supabase, filters, limit)
        break
      case "voice":
        results = await executeVoiceSearch(supabase, query, filters, limit)
        break
      default:
        results = await executeNaturalLanguageSearch(supabase, query, filters, limit)
    }

    totalCount = results.length

    // Log the search query
    await supabase.from("memory_search_queries").insert({
      admin_id: adminId,
      search_query: query,
      search_type: searchType,
      search_filters: filters,
      results_count: totalCount,
      search_duration_ms: Date.now() - startTime,
      is_voice_query: isVoiceQuery,
      query_intent: queryIntent,
    })

    // Generate AI summary of results
    const summary = generateSearchSummary(results, query, queryIntent)

    return NextResponse.json({
      success: true,
      results,
      totalCount,
      summary,
      queryIntent,
      searchDuration: Date.now() - startTime,
      suggestions: generateSearchSuggestions(results, queryIntent),
    })
  } catch (error) {
    console.error("Memory vault search error:", error)
    return NextResponse.json({ error: "Failed to search memory vault", details: error.message }, { status: 500 })
  }
}

async function executeNaturalLanguageSearch(supabase: any, query: string, filters: any, limit: number) {
  const results = []

  // Search context memory vault
  const { data: memoryResults } = await supabase.rpc("search_emotional_memories", {
    p_query: query,
    p_emotion_filter: filters.emotion,
    p_date_start: filters.dateStart,
    p_date_end: filters.dateEnd,
    p_feature_filter: filters.feature,
    p_limit: Math.floor(limit / 4),
  })

  if (memoryResults) {
    results.push(
      ...memoryResults.map((r) => ({
        ...r,
        source_table: "context_memory_vault",
        type: "memory",
      })),
    )
  }

  // Search assistant interactions
  let interactionQuery = supabase
    .from("assistant_interaction_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.floor(limit / 4))

  if (query) {
    interactionQuery = interactionQuery.or(`command_input.ilike.%${query}%,response_output.ilike.%${query}%`)
  }

  if (filters.emotion) {
    interactionQuery = interactionQuery.eq("emotional_tone", filters.emotion)
  }

  if (filters.dateStart) {
    interactionQuery = interactionQuery.gte("created_at", filters.dateStart)
  }

  if (filters.dateEnd) {
    interactionQuery = interactionQuery.lte("created_at", filters.dateEnd)
  }

  const { data: interactionResults } = await interactionQuery

  if (interactionResults) {
    results.push(
      ...interactionResults.map((r) => ({
        ...r,
        source_table: "assistant_interaction_logs",
        type: "interaction",
      })),
    )
  }

  // Search user feedback
  let feedbackQuery = supabase
    .from("user_feedback_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.floor(limit / 4))

  if (query) {
    feedbackQuery = feedbackQuery.ilike("feedback_message", `%${query}%`)
  }

  if (filters.emotion) {
    feedbackQuery = feedbackQuery.eq("sentiment", filters.emotion)
  }

  if (filters.dateStart) {
    feedbackQuery = feedbackQuery.gte("created_at", filters.dateStart)
  }

  if (filters.dateEnd) {
    feedbackQuery = feedbackQuery.lte("created_at", filters.dateEnd)
  }

  const { data: feedbackResults } = await feedbackQuery

  if (feedbackResults) {
    results.push(
      ...feedbackResults.map((r) => ({
        ...r,
        source_table: "user_feedback_logs",
        type: "feedback",
      })),
    )
  }

  // Search gift clicks
  let clickQuery = supabase
    .from("gift_click_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.floor(limit / 4))

  if (filters.emotion) {
    clickQuery = clickQuery.eq("emotional_context", filters.emotion)
  }

  if (filters.dateStart) {
    clickQuery = clickQuery.gte("created_at", filters.dateStart)
  }

  if (filters.dateEnd) {
    clickQuery = clickQuery.lte("created_at", filters.dateEnd)
  }

  const { data: clickResults } = await clickQuery

  if (clickResults) {
    results.push(
      ...clickResults.map((r) => ({
        ...r,
        source_table: "gift_click_logs",
        type: "gift_interaction",
      })),
    )
  }

  return results.sort(
    (a, b) => new Date(b.created_at || b.logged_at).getTime() - new Date(a.created_at || a.logged_at).getTime(),
  )
}

async function executeSemanticSearch(supabase: any, query: string, filters: any, limit: number) {
  // For semantic search, we'll use the full-text search capabilities
  return executeNaturalLanguageSearch(supabase, query, filters, limit)
}

async function executeFilterSearch(supabase: any, filters: any, limit: number) {
  return executeNaturalLanguageSearch(supabase, "", filters, limit)
}

async function executeVoiceSearch(supabase: any, query: string, filters: any, limit: number) {
  // Parse voice query for specific patterns
  const voiceFilters = parseVoiceQuery(query)
  const combinedFilters = { ...filters, ...voiceFilters }

  return executeNaturalLanguageSearch(supabase, query, combinedFilters, limit)
}

function parseQueryIntent(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("fail") || lowerQuery.includes("error") || lowerQuery.includes("problem")) {
    return "failure_analysis"
  } else if (lowerQuery.includes("success") || lowerQuery.includes("positive") || lowerQuery.includes("love")) {
    return "success_analysis"
  } else if (lowerQuery.includes("trend") || lowerQuery.includes("pattern") || lowerQuery.includes("over time")) {
    return "trend_analysis"
  } else if (lowerQuery.includes("user") && lowerQuery.includes("specific")) {
    return "user_specific"
  } else if (lowerQuery.includes("emotion") || lowerQuery.includes("feeling") || lowerQuery.includes("mood")) {
    return "emotional_analysis"
  } else if (lowerQuery.includes("gift") || lowerQuery.includes("present") || lowerQuery.includes("recommendation")) {
    return "gifting_analysis"
  } else {
    return "general_search"
  }
}

function parseVoiceQuery(query: string): any {
  const filters: any = {}
  const lowerQuery = query.toLowerCase()

  // Extract emotions
  const emotions = ["joy", "sadness", "anger", "fear", "love", "anxiety", "excitement", "frustration"]
  for (const emotion of emotions) {
    if (lowerQuery.includes(emotion)) {
      filters.emotion = emotion
      break
    }
  }

  // Extract time periods
  if (lowerQuery.includes("today")) {
    filters.dateStart = new Date().toISOString().split("T")[0]
  } else if (lowerQuery.includes("yesterday")) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    filters.dateStart = yesterday.toISOString().split("T")[0]
    filters.dateEnd = yesterday.toISOString().split("T")[0]
  } else if (lowerQuery.includes("this week")) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    filters.dateStart = weekStart.toISOString().split("T")[0]
  } else if (lowerQuery.includes("last week")) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    filters.dateStart = weekStart.toISOString().split("T")[0]
    filters.dateEnd = weekEnd.toISOString().split("T")[0]
  } else if (lowerQuery.includes("valentine")) {
    filters.dateStart = "2024-02-10"
    filters.dateEnd = "2024-02-18"
  }

  // Extract features
  const features = ["bondcraft", "lumience", "agent_gifty", "ghost_hunt", "serendipity"]
  for (const feature of features) {
    if (lowerQuery.includes(feature)) {
      filters.feature = feature
      break
    }
  }

  return filters
}

function generateSearchSummary(results: any[], query: string, intent: string): string {
  if (results.length === 0) {
    return "No memories found matching your search criteria. Try broadening your search terms or adjusting the filters."
  }

  const memoryCount = results.filter((r) => r.type === "memory").length
  const interactionCount = results.filter((r) => r.type === "interaction").length
  const feedbackCount = results.filter((r) => r.type === "feedback").length
  const giftCount = results.filter((r) => r.type === "gift_interaction").length

  let summary = `Found ${results.length} memories across the vault. `

  if (memoryCount > 0) summary += `${memoryCount} emotional memories, `
  if (interactionCount > 0) summary += `${interactionCount} AI interactions, `
  if (feedbackCount > 0) summary += `${feedbackCount} user feedback entries, `
  if (giftCount > 0) summary += `${giftCount} gift interactions. `

  // Add intent-specific insights
  switch (intent) {
    case "failure_analysis":
      const failures = results.filter(
        (r) =>
          r.sentiment_score < 0 || r.reaction_score < 5 || r.status === "error" || r.user_satisfaction === "very_low",
      )
      summary += `Identified ${failures.length} potential failure points for analysis.`
      break
    case "success_analysis":
      const successes = results.filter(
        (r) => r.sentiment_score > 0.5 || r.reaction_score > 7 || r.user_satisfaction === "very_high",
      )
      summary += `Found ${successes.length} highly successful interactions to learn from.`
      break
    case "emotional_analysis":
      const emotions = [
        ...new Set(results.map((r) => r.emotional_context || r.sentiment || r.emotional_tone).filter(Boolean)),
      ]
      summary += `Emotional themes include: ${emotions.slice(0, 5).join(", ")}.`
      break
    default:
      summary += "Results span multiple interaction types and emotional contexts."
  }

  return summary
}

function generateSearchSuggestions(results: any[], intent: string): string[] {
  const suggestions = []

  if (results.length > 0) {
    suggestions.push("Export these results as a detailed report")
    suggestions.push("Generate insights from this memory pattern")
    suggestions.push("Create a follow-up gift flow based on these findings")
  }

  switch (intent) {
    case "failure_analysis":
      suggestions.push("Show me the timeline of these failures")
      suggestions.push("What features were involved in these issues?")
      suggestions.push("Generate improvement recommendations")
      break
    case "success_analysis":
      suggestions.push("What made these interactions successful?")
      suggestions.push("Can we replicate this success pattern?")
      suggestions.push("Show similar successful cases")
      break
    case "emotional_analysis":
      suggestions.push("Show emotional intensity over time")
      suggestions.push("Compare with seasonal patterns")
      suggestions.push("Identify emotional triggers")
      break
  }

  return suggestions.slice(0, 5)
}

const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
