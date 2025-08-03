interface EcosystemHealthData {
  healthScore: number
  activeUsers: number
  activeAssistants: number
  avgApiResponseTime: number
  errorRate: number
  systemAlerts: Array<{
    id: string
    type: "error" | "warning" | "info"
    message: string
    timestamp: string
    severity: "high" | "medium" | "low"
  }>
  topAssistants: Array<{
    id: string
    name: string
    usage: number
    satisfaction: number
    apiCost: number
    category: string
  }>
  usageTrends: Array<{
    date: string
    interactions: number
    uniqueUsers: number
    avgResponseTime: number
  }>
  featureStats: Array<{
    name: string
    usageCount: number
    uniqueUsers: number
    adoptionRate: number
    category: string
  }>
  satisfactionAverages: {
    overall: number
    byAssistant: Array<{
      id: string
      name: string
      satisfaction: number
    }>
  }
  lastUpdated: string
  metricsSummary: {
    totalInteractions24h: number
    totalFeatures: number
    avgSessionDuration: number
    peakUsageHour: number
  }
}

export const fetchEcosystemHealth = async (): Promise<EcosystemHealthData> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration")
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/get_ecosystem_health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  })

  const result = await res.json()

  if (!res.ok) {
    console.error("[AGAI HEALTH MONITOR ERROR]", result.error)
    throw new Error(`Ecosystem health fetch failed: ${result.error}`)
  }

  return {
    healthScore: result.health_score,
    activeUsers: result.active_users,
    activeAssistants: result.active_assistants,
    avgApiResponseTime: result.api_response_time,
    errorRate: result.error_rate,
    systemAlerts: result.system_alerts,
    topAssistants: result.top_assistants,
    usageTrends: result.usage_trends,
    featureStats: result.feature_stats,
    satisfactionAverages: result.satisfaction_averages,
    lastUpdated: result.last_updated,
    metricsSummary: result.metrics_summary,
  }
}

export const getHealthScoreColor = (score: number): string => {
  if (score >= 90) return "text-emerald-600"
  if (score >= 75) return "text-yellow-600"
  if (score >= 60) return "text-orange-600"
  return "text-red-600"
}

export const getHealthScoreGradient = (score: number): string => {
  if (score >= 90) return "from-emerald-500 to-teal-500"
  if (score >= 75) return "from-yellow-500 to-orange-500"
  if (score >= 60) return "from-orange-500 to-red-500"
  return "from-red-500 to-rose-500"
}

export const getAlertColor = (type: string): string => {
  switch (type) {
    case "error":
      return "border-red-500 bg-red-50 text-red-800"
    case "warning":
      return "border-yellow-500 bg-yellow-50 text-yellow-800"
    case "info":
      return "border-blue-500 bg-blue-50 text-blue-800"
    default:
      return "border-gray-500 bg-gray-50 text-gray-800"
  }
}

export const formatResponseTime = (ms: number): string => {
  if (ms < 100) return `${ms.toFixed(0)}ms (Excellent)`
  if (ms < 300) return `${ms.toFixed(0)}ms (Good)`
  if (ms < 500) return `${ms.toFixed(0)}ms (Fair)`
  return `${ms.toFixed(0)}ms (Slow)`
}

export const calculateTrendDirection = (trends: Array<{ interactions: number }>): "up" | "down" | "stable" => {
  if (trends.length < 2) return "stable"

  const recent = trends.slice(-3).reduce((sum, t) => sum + t.interactions, 0)
  const previous = trends.slice(-6, -3).reduce((sum, t) => sum + t.interactions, 0)

  if (recent > previous * 1.1) return "up"
  if (recent < previous * 0.9) return "down"
  return "stable"
}
