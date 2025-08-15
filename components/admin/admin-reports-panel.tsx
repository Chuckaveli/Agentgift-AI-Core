"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  Users,
  Bot,
  Sparkles,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Download,
  Send,
  Settings,
  Clock,
  Star,
  Zap,
  Crown,
  Gem,
} from "lucide-react"
import { toast } from "sonner"

interface ReportsData {
  summary: {
    headline: string
    totalUsers: number
    activeAssistants: number
    xpDistributed: number
    systemHealth: number
  }
  userSignups: {
    total: number
    free: number
    pro: number
    proPlus: number
    enterprise: number
    growth: number
  }
  topAssistants: Array<{
    id: string
    name: string
    usage: number
    satisfaction: number
    apiCost: number
    category: string
  }>
  featureEngagement: Array<{
    name: string
    clicks: number
    uniqueUsers: number
    conversionRate: number
  }>
  xpActivity: {
    badgesEarned: number
    xpSpent: number
    unlocksTriggered: number
    distribution: Array<{
      feature: string
      xp: number
      color: string
    }>
  }
  systemAlerts: Array<{
    id: string
    type: "error" | "warning" | "info"
    message: string
    timestamp: string
    resolved: boolean
  }>
  assistantUsage: Array<{
    date: string
    interactions: number
    uniqueUsers: number
  }>
  recentEvents: Array<{
    id: string
    type: string
    message: string
    timestamp: string
    user?: string
  }>
}

const TIER_COLORS = {
  free: "#94a3b8",
  pro: "#f59e0b",
  proPlus: "#8b5cf6",
  enterprise: "#ef4444",
  nft: "#10b981",
}

const CHART_COLORS = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export function AdminReportsPanel() {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "seasonal">("weekly")
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReportsData()
  }, [timeRange])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports?range=${timeRange}`)
      if (!response.ok) throw new Error("Failed to fetch reports data")
      const reportsData = await response.json()
      setData(reportsData)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load reports data")
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: "json" | "email") => {
    try {
      setExporting(true)
      const response = await fetch("/api/admin/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, data, timeRange }),
      })

      if (!response.ok) throw new Error("Export failed")

      if (format === "json") {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `agentgift-reports-${timeRange}-${new Date().toISOString().split("T")[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }

      toast.success(`Reports ${format === "json" ? "downloaded" : "emailed"} successfully`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export reports")
    } finally {
      setExporting(false)
    }
  }

  const saveDiscordWebhook = async () => {
    try {
      const response = await fetch("/api/admin/reports/discord-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook: discordWebhook }),
      })

      if (!response.ok) throw new Error("Failed to save webhook")
      toast.success("Discord webhook saved successfully")
    } catch (error) {
      console.error("Webhook save error:", error)
      toast.error("Failed to save Discord webhook")
    }
  }

  if (loading || !data) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            AgentGift Admin Reports
          </h1>
          <p className="text-muted-foreground mt-1">{data.summary.headline}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{data.summary.totalUsers.toLocaleString()}</p>
                <p className="text-pink-100 text-xs">
                  +{data.userSignups.growth}% this {timeRange.slice(0, -2)}
                </p>
              </div>
              <Users className="h-8 w-8 text-pink-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Assistants</p>
                <p className="text-2xl font-bold">{data.summary.activeAssistants}</p>
                <p className="text-purple-100 text-xs">Across all tiers</p>
              </div>
              <Bot className="h-8 w-8 text-purple-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">XP Distributed</p>
                <p className="text-2xl font-bold">{data.summary.xpDistributed.toLocaleString()}</p>
                <p className="text-indigo-100 text-xs">Engagement rewards</p>
              </div>
              <Sparkles className="h-8 w-8 text-indigo-200 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">System Health</p>
                <p className="text-2xl font-bold">{data.summary.systemHealth}%</p>
                <p className="text-emerald-100 text-xs">All systems operational</p>
              </div>
              <div className="relative">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-200 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Signups Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Signups Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                <span className="text-sm font-medium">Free</span>
              </div>
              <p className="text-2xl font-bold">{data.userSignups.free}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="text-sm font-medium">Pro</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{data.userSignups.pro}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Gem className="h-3 w-3 text-purple-500" />
                <span className="text-sm font-medium">Pro+</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{data.userSignups.proPlus}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Zap className="h-3 w-3 text-red-500" />
                <span className="text-sm font-medium">Enterprise</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{data.userSignups.enterprise}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Trophy className="h-3 w-3 text-emerald-500" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{data.userSignups.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assistant Usage Over Time */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Assistant Usage Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.assistantUsage}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
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
                  fill="url(#usageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Engagement */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Feature Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.featureEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* XP Distribution and System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* XP Distribution Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>XP Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.xpActivity.distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="xp"
                  label={({ feature, percent }) => `${feature} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.xpActivity.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Events and System Alerts */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Live Activity Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-pink-500 mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.user && <span className="text-xs text-muted-foreground">by {event.user}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Assistants Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Top Performing Assistants</span>
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
                </tr>
              </thead>
              <tbody>
                {data.topAssistants.map((assistant) => (
                  <tr
                    key={assistant.id}
                    className="border-b hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors"
                  >
                    <td className="p-2">
                      <div className="font-medium">{assistant.name}</div>
                      <div className="text-xs text-muted-foreground">{assistant.id}</div>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === "error"
                      ? "border-red-500 bg-red-50"
                      : alert.type === "warning"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant={alert.resolved ? "default" : "destructive"}>
                      {alert.resolved ? "Resolved" : "Active"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export and Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Export & Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="space-y-4">
              <h3 className="font-medium">Export Reports</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportData("json")}
                  disabled={exporting}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button onClick={() => exportData("email")} disabled={exporting} variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Email Report
                </Button>
              </div>
            </div>

            {/* Discord Webhook */}
            <div className="space-y-4">
              <h3 className="font-medium">Discord Notifications</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Discord webhook URL"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveDiscordWebhook} variant="outline">
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Receive real-time alerts and daily summaries in Discord</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

