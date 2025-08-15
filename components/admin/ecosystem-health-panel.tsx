"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Users, Bot, Clock, AlertCircle } from 'lucide-react'
import { fetchEcosystemHealth, getHealthScoreColor, getHealthScoreGradient, getAlertColor, formatResponseTime, calculateTrendDirection } from "@/lib/ecosystem-health"

interface EcosystemHealthPanelProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function EcosystemHealthPanel({ autoRefresh = true, refreshInterval = 15000 }: EcosystemHealthPanelProps) {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchEcosystemHealth()
      setHealthData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ecosystem health")
      console.error("Ecosystem health fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getTrendIcon = (direction: "up" | "down" | "stable") => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-6 w-6 text-emerald-600" />
    if (score >= 75) return <AlertCircle className="h-6 w-6 text-yellow-600" />
    return <XCircle className="h-6 w-6 text-red-600" />
  }

  if (loading && !healthData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Ecosystem Health Monitor
          </h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-800">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!healthData) return null

  const trendDirection = calculateTrendDirection(healthData.usageTrends || [])
  const pieChartData = healthData.featureStats?.slice(0, 6).map((feature: any, index: number) => ({
    name: feature.name,
    value: feature.usageCount,
    color: `hsl(${280 + index * 30}, 70%, 60%)`
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Ecosystem Health Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time system performance and user engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {healthData.systemAlerts && healthData.systemAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          {healthData.systemAlerts.map((alert: any) => (
            <Alert key={alert.id} className={getAlertColor(alert.type)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Health Score Overview */}
      <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getHealthIcon(healthData.healthScore)}
            <span className="text-xl">Overall System Health</span>
            {getTrendIcon(trendDirection)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl font-bold">
              <span className={getHealthScoreColor(healthData.healthScore)}>
                {healthData.healthScore}%
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Status</div>
              <div className={`font-semibold ${getHealthScoreColor(healthData.healthScore)}`}>
                {healthData.healthScore >= 90 ? 'Excellent' : 
                 healthData.healthScore >= 75 ? 'Good' : 
                 healthData.healthScore >= 60 ? 'Fair' : 'Poor'}
              </div>
            </div>
          </div>
          <Progress 
            value={healthData.healthScore} 
            className="h-3"
            style={{
              background: `linear-gradient(to right, ${getHealthScoreGradient(healthData.healthScore)})`
            }}
          />
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Users</p>
                <p className="text-3xl font-bold text-blue-900">{healthData.activeUsers}</p>
                <p className="text-xs text-blue-600 mt-1">Last 24 hours</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Active Assistants</p>
                <p className="text-3xl font-bold text-purple-900">{healthData.activeAssistants}</p>
                <p className="text-xs text-purple-600 mt-1">Currently responding</p>
              </div>
              <Bot className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Response Time</p>
                <p className="text-3xl font-bold text-emerald-900">{healthData.avgApiResponseTime}ms</p>
                <p className="text-xs text-emerald-600 mt-1">{formatResponseTime(healthData.avgApiResponseTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Error Rate</p>
                <p className="text-3xl font-bold text-orange-900">{healthData.errorRate.toFixed(1)}%</p>
                <p className="text-xs text-orange-600 mt-1">
                  {healthData.errorRate < 1 ? 'Excellent' : healthData.errorRate < 5 ? 'Good' : 'Needs attention'}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends Chart */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Usage Trends (7 Days)
            </CardTitle>
            <CardDescription>Daily interactions and unique users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={healthData.usageTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#8b5cf6" 
                  fill="url(#colorInteractions)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="uniqueUsers" 
                  stroke="#ec4899" 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Usage Chart */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-pink-600" />
              Feature Adoption
            </CardTitle>
            <CardDescription>Top features by usage count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Assistants Table */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            Top Performing Assistants
          </CardTitle>
          <CardDescription>Ranked by usage, satisfaction, and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assistant</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Satisfaction</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">API Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                </tr>
              </thead>
              <tbody>
                {healthData.topAssistants?.slice(0, 5).map((assistant: any, index: number) => (
                  <tr key={assistant.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${index === 0 ? 'from-yellow-400 to-orange-500' : index === 1 ? 'from-gray-300 to-gray-500' : index === 2 ? 'from-orange-400 to-red-500' : 'from-purple-400 to-pink-500'} flex items-center justify-center text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{assistant.name}</div>
                          <div className="text-sm text-gray-500">{assistant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{assistant.usage}</span>
                        <span className="text-sm text-gray-500">interactions</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{assistant.satisfaction.toFixed(1)}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < Math.floor(assistant.satisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">${assistant.apiCost.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        {assistant.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-gray-50 to-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle>24-Hour Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{healthData.metricsSummary?.totalInteractions24h || 0}</div>
              <div className="text-sm text-gray-600">Total Interactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{healthData.metricsSummary?.totalFeatures || 0}</div>
              <div className="text-sm text-gray-600">Active Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{Math.round(healthData.metricsSummary?.avgSessionDuration || 0)}s</div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{healthData.metricsSummary?.peakUsageHour || 0}:00</div>
              <div className="text-sm text-gray-600">Peak Hour</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

