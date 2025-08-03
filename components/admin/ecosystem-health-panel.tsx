"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Activity,
  Users,
  Bot,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Star,
  Gauge,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchEcosystemHealth,
  getHealthScoreColor,
  getHealthScoreGradient,
  getAlertColor,
  formatResponseTime,
  calculateTrendDirection,
} from "@/lib/ecosystem-health"

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

const CHART_COLORS = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export function EcosystemHealthPanel() {
  const [data, setData] = useState<EcosystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const loadHealthData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const healthData = await fetchEcosystemHealth()
      setData(healthData)
      setLastRefresh(new Date())

      if (showRefreshing) {
        toast.success("Ecosystem health data refreshed")
      }
    } catch (error) {
      console.error("Error loading ecosystem health:", error)
      toast.error("Failed to load ecosystem health data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadHealthData()
  }, [loadHealthData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadHealthData(true)
    }, 15000) // Refresh every 15 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, loadHealthData])

  const handleManualRefresh = () => {
    loadHealthData(true)
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    toast.info(autoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled")
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const trendDirection = calculateTrendDirection(data.usageTrends)
  const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Ecosystem Health Monitor
          </h2>
          <p className="text-muted-foreground text-sm">Last updated: {lastRefresh?.toLocaleTimeString() || "Never"}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? "text-green-600" : ""}`} />
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Score */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${getHealthScoreGradient(data.healthScore)}`}>
                <Gauge className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">System Health Score</h3>
                <p className={`text-3xl font-bold ${getHealthScoreColor(data.healthScore)}`}>{data.healthScore}%</p>
                <p className="text-sm text-muted-foreground">
                  {data.healthScore >= 90
                    ? "Excellent"
                    : data.healthScore >= 75
                      ? "Good"
                      : data.healthScore >= 60
                        ? "Fair"
                        : "Poor"}{" "}
                  system performance
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <TrendIcon
                  className={`h-4 w-4 ${
                    trendDirection === "up"
                      ? "text-green-600"
                      : trendDirection === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {trendDirection === "up" ? "Trending up" : trendDirection === "down" ? "Trending down" : "Stable"}
                </span>
              </div>
              <Progress value={data.healthScore} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</p>
                <p className="text-blue-100 text-xs">Last 24 hours</p>
              </div>
              <Users className="h-8 w-8 text-blue-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Assistants</p>
                <p className="text-2xl font-bold">{data.activeAssistants}</p>
                <p className="text-purple-100 text-xs">Currently responding</p>
              </div>
              <Bot className="h-8 w-8 text-purple-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Response Time</p>
                <p className="text-2xl font-bold">{data.avgApiResponseTime}ms</p>
                <p className="text-emerald-100 text-xs">{formatResponseTime(data.avgApiResponseTime).split(" ")[1]}</p>
              </div>
              <Zap className="h-8 w-8 text-emerald-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Error Rate</p>
                <p className="text-2xl font-bold">{data.errorRate.toFixed(1)}%</p>
                <p className="text-yellow-100 text-xs">
                  {data.errorRate < 1 ? "Excellent" : data.errorRate < 5 ? "Good" : "Needs attention"}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Usage Trends (7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.usageTrends}>
                <defs>
                  <linearGradient id="interactionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="interactions"
                  stroke="#ec4899"
                  fillOpacity={1}
                  fill="url(#interactionsGradient)"
                  name="Interactions"
                />
                <Area
                  type="monotone"
                  dataKey="uniqueUsers"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#usersGradient)"
                  name="Unique Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Adoption */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Feature Adoption Rates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.featureStats.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Adoption Rate"]} />
                <Bar dataKey="adoptionRate" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Assistants Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Top Assistant Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Assistant</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Usage</th>
                  <th className="text-left p-2">Satisfaction</th>
                  <th className="text-left p-2">API Cost</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.topAssistants.slice(0, 8).map((assistant) => (
                  <tr
                    key={assistant.id}
                    className="border-b hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors"
                  >
                    <td className="p-2">
                      <div className="font-medium">{assistant.name}</div>
                      <div className="text-xs text-muted-foreground">{assistant.id.slice(0, 12)}...</div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{assistant.category}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium">{assistant.usage.toLocaleString()}</div>
                        <Progress
                          value={(assistant.usage / Math.max(...data.topAssistants.map((a) => a.usage))) * 100}
                          className="w-16 h-2"
                        />
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{assistant.satisfaction.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-sm font-medium">${assistant.apiCost.toFixed(2)}</span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {data.systemAlerts.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>System Alerts</span>
              <Badge variant="destructive">{data.systemAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.systemAlerts.map((alert) => {
                const AlertIcon = alert.type === "error" ? XCircle : alert.type === "warning" ? AlertCircle : Info

                return (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{alert.message}</p>
                          <Badge
                            variant={
                              alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-75 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="h-5 w-5" />
            <span>24-Hour Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50">
              <p className="text-2xl font-bold text-pink-600">{data.metricsSummary.totalInteractions24h}</p>
              <p className="text-sm text-muted-foreground">Total Interactions</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
              <p className="text-2xl font-bold text-purple-600">{data.metricsSummary.totalFeatures}</p>
              <p className="text-sm text-muted-foreground">Active Features</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-cyan-50">
              <p className="text-2xl font-bold text-indigo-600">
                {Math.round(data.metricsSummary.avgSessionDuration)}s
              </p>
              <p className="text-sm text-muted-foreground">Avg Session</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-teal-50">
              <p className="text-2xl font-bold text-cyan-600">{data.metricsSummary.peakUsageHour}:00</p>
              <p className="text-sm text-muted-foreground">Peak Hour</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satisfaction Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Satisfaction Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-3xl font-bold text-yellow-600">{data.satisfactionAverages.overall}</p>
              <p className="text-sm text-muted-foreground">Overall Satisfaction</p>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(data.satisfactionAverages.overall) ? "text-yellow-500 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {data.satisfactionAverages.byAssistant.slice(0, 5).map((assistant) => (
              <div key={assistant.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{assistant.name}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={assistant.satisfaction * 20} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{assistant.satisfaction.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
