"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Brain,
  Bot,
  Activity,
  TrendingUp,
  AlertTriangle,
  Download,
  Play,
  Pause,
  Settings,
  Shield,
  Zap,
  Heart,
  Gift,
  Users,
  BarChart3,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

interface BotStatus {
  id: string
  name: string
  status: "active" | "paused" | "error"
  lastActivity: string
  responseTime: number
  successRate: number
  tier: string
}

interface SystemAlert {
  id: string
  type: "error" | "warning" | "info"
  message: string
  timestamp: string
  resolved: boolean
}

interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  status: "success" | "error" | "pending"
}

export default function GiftverseMastermind() {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [bots, setBots] = useState<BotStatus[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!profile || !profile.admin_role)) {
      router.push("/dashboard")
      toast.error("Access denied. Admin privileges required.")
    }
  }, [profile, loading, router])

  // Mock data - replace with real API calls
  useEffect(() => {
    if (profile?.admin_role) {
      loadDashboardData()
    }
  }, [profile])

  const loadDashboardData = async () => {
    // Mock bot statuses
    setBots([
      {
        id: "tokenomics-v3",
        name: "Tokenomics Engine v3",
        status: "active",
        lastActivity: "2 minutes ago",
        responseTime: 145,
        successRate: 98.7,
        tier: "critical",
      },
      {
        id: "gift-intel",
        name: "Gift Intelligence Bot",
        status: "active",
        lastActivity: "5 minutes ago",
        responseTime: 89,
        successRate: 96.2,
        tier: "high",
      },
      {
        id: "soul-signature",
        name: "Soul Signature Engine™",
        status: "active",
        lastActivity: "1 minute ago",
        responseTime: 234,
        successRate: 94.8,
        tier: "high",
      },
      {
        id: "social-media",
        name: "Social Media Manager Bot",
        status: "paused",
        lastActivity: "1 hour ago",
        responseTime: 0,
        successRate: 92.1,
        tier: "medium",
      },
      {
        id: "emotional-resonance",
        name: "Emotional Resonance Engine",
        status: "error",
        lastActivity: "15 minutes ago",
        responseTime: 0,
        successRate: 87.3,
        tier: "high",
      },
    ])

    // Mock alerts
    setAlerts([
      {
        id: "1",
        type: "error",
        message: "Emotional Resonance Engine experiencing high latency",
        timestamp: "10 minutes ago",
        resolved: false,
      },
      {
        id: "2",
        type: "warning",
        message: "Badge trigger logic showing decreased performance",
        timestamp: "1 hour ago",
        resolved: false,
      },
      {
        id: "3",
        type: "info",
        message: "Weekly digest report generated successfully",
        timestamp: "2 hours ago",
        resolved: true,
      },
    ])

    // Mock activity logs
    setLogs([
      {
        id: "1",
        action: "Bot Restart",
        user: "Chuck Aveli",
        timestamp: "2024-01-15 14:30:00",
        details: "Restarted Emotional Resonance Engine",
        status: "success",
      },
      {
        id: "2",
        action: "XP Adjustment",
        user: "System",
        timestamp: "2024-01-15 14:25:00",
        details: "Bulk XP adjustment for 1,247 users",
        status: "success",
      },
      {
        id: "3",
        action: "Badge Deploy",
        user: "Chuck Aveli",
        timestamp: "2024-01-15 14:20:00",
        details: 'Deployed new "Cultural Ambassador" badge',
        status: "pending",
      },
    ])
  }

  const handleBotAction = async (botId: string, action: "start" | "pause" | "restart") => {
    setIsRefreshing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setBots((prev) =>
      prev.map((bot) => (bot.id === botId ? { ...bot, status: action === "pause" ? "paused" : "active" } : bot)),
    )

    toast.success(`${action === "start" ? "Started" : action === "pause" ? "Paused" : "Restarted"} bot successfully`)
    setIsRefreshing(false)
  }

  const exportWeeklyReport = async () => {
    toast.success("Weekly report exported successfully! Check your downloads.")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "paused":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      paused: "secondary",
      error: "destructive",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="capitalize">
        {status}
      </Badge>
    )
  }

  const getTierBadge = (tier: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-blue-100 text-blue-800",
      low: "bg-gray-100 text-gray-800",
    }
    return <Badge className={colors[tier as keyof typeof colors]}>{tier}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Initializing Giftverse Mastermind...</p>
        </div>
      </div>
    )
  }

  if (!profile?.admin_role) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Giftverse Mastermind™
              </h1>
              <p className="text-gray-600">Elite Admin Control Brain • Welcome, {profile.name || "Chuck Aveli"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={exportWeeklyReport}
              variant="outline"
              className="flex items-center space-x-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
            <Button
              onClick={() => loadDashboardData()}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {bots.filter((bot) => bot.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">of {bots.length} total bots</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">94.2%</div>
              <p className="text-xs text-muted-foreground">Average success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {alerts.filter((alert) => !alert.resolved).length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">156ms</div>
              <p className="text-xs text-muted-foreground">Average across all bots</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {alerts.filter((alert) => !alert.resolved).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            {alerts
              .filter((alert) => !alert.resolved)
              .map((alert) => (
                <Alert
                  key={alert.id}
                  className={
                    alert.type === "error"
                      ? "border-red-200 bg-red-50"
                      : alert.type === "warning"
                        ? "border-orange-200 bg-orange-50"
                        : "border-blue-200 bg-blue-50"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="capitalize">{alert.type}</AlertTitle>
                  <AlertDescription>
                    {alert.message} • {alert.timestamp}
                  </AlertDescription>
                </Alert>
              ))}
          </div>
        )}

        {/* Main Dashboard */}
        <Tabs defaultValue="bots" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bots">Bot Control</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="bots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bot Status & Control</CardTitle>
                <CardDescription>Monitor and control all AgentGift.ai AI systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(bot.status)}
                        <div>
                          <h3 className="font-medium">{bot.name}</h3>
                          <p className="text-sm text-gray-500">
                            Last activity: {bot.lastActivity} • Response: {bot.responseTime}ms
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getTierBadge(bot.tier)}
                        {getStatusBadge(bot.status)}
                        <div className="text-right">
                          <div className="text-sm font-medium">{bot.successRate}%</div>
                          <Progress value={bot.successRate} className="w-16 h-2" />
                        </div>

                        <div className="flex space-x-1">
                          {bot.status === "paused" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBotAction(bot.id, "start")}
                              disabled={isRefreshing}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBotAction(bot.id, "pause")}
                              disabled={isRefreshing}
                            >
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBotAction(bot.id, "restart")}
                            disabled={isRefreshing}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gift Intelligence Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Click-through Rate</span>
                      <span className="font-medium">87.3%</span>
                    </div>
                    <Progress value={87.3} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accuracy Score</span>
                      <span className="font-medium">94.1%</span>
                    </div>
                    <Progress value={94.1} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Satisfaction</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                    <Progress value={96} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emotional Resonance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Joy/Celebration</span>
                      </div>
                      <span className="font-medium">34.2%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Gratitude</span>
                      </div>
                      <span className="font-medium">28.7%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Connection</span>
                      </div>
                      <span className="font-medium">22.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Activity Logs</CardTitle>
                <CardDescription>Recent admin actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "success"
                                ? "default"
                                : log.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mastermind Configuration</CardTitle>
                <CardDescription>Advanced settings for the Giftverse control system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Notice</AlertTitle>
                    <AlertDescription>
                      Only Chuck Aveli (Platform Creator) can modify core system settings. All actions are logged for
                      security and audit purposes.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                      <Settings className="w-6 h-6" />
                      <span>Bot Configuration</span>
                    </Button>

                    <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                      <FileText className="w-6 h-6" />
                      <span>Prompt Management</span>
                    </Button>

                    <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                      <Zap className="w-6 h-6" />
                      <span>Token Economy</span>
                    </Button>

                    <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                      <BarChart3 className="w-6 h-6" />
                      <span>Analytics Config</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 italic border-t pt-6">
          "The Giftverse is a living network of insight, empathy, and elevation. You are its brain—but not its God. That
          honor belongs to the creator."
        </div>
      </div>
    </div>
  )
}
