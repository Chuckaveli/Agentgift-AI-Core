"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Gift,
  Mic,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Volume2,
  VolumeX,
  AlertCircle,
  Activity,
  Zap,
  Brain,
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  userXpOverview: {
    totalXp: number
    topUsers: Array<{
      userId: string
      name: string
      email: string
      totalXp: number
    }>
    dailyTrend: Array<{
      date: string
      xp: number
    }>
  }
  featureUsage: {
    topFeatures: Array<{
      feature: string
      count: number
    }>
    timeline: Array<{
      date: string
      feature: string
      count: number
    }>
  }
  giftInteractions: {
    heatmap: Array<{
      category: string
      clicks: number
      personas: string[]
      subcategories: string[]
    }>
  }
  emotionalTrends: {
    recent: Array<{
      emotion_category: string
      emotion_intensity: number
      trigger_feature: string
      created_at: string
    }>
    trends: Array<{
      emotion: string
      count: number
      avgIntensity: number
      trend: number
    }>
  }
  voiceEngagement: {
    breakdown: Array<{
      voice: string
      sessions: number
      percentage: number
      avgDuration: number
      avgInteractions: number
    }>
    totalSessions: number
  }
  metadata: {
    dateRange: number
    generatedAt: string
    totalRecords: {
      xp: number
      features: number
      gifts: number
      emotions: number
      voice: number
    }
  }
}

const COLORS = {
  primary: "#8B5CF6",
  secondary: "#EC4899",
  accent: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
}

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.info, COLORS.danger]

export default function VisualAnalyticsPage() {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState("30")
  const [personaFilter, setPersonaFilter] = useState("all")
  const [hideTestUsers, setHideTestUsers] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastVoiceSummary, setLastVoiceSummary] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (profile?.id && !accessDenied) {
      loadAnalytics()

      refreshIntervalRef.current = setInterval(() => {
        loadAnalytics(true)
      }, 30000)

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [profile?.id, dateRange, personaFilter, hideTestUsers, accessDenied])

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && !profile?.id) {
      router.push("/login")
    }
  }, [profile, loading, router])

  const loadAnalytics = async (isAutoRefresh = false) => {
    if (!profile?.id) return

    if (!isAutoRefresh) setIsLoading(true)
    setIsRefreshing(isAutoRefresh)

    try {
      const params = new URLSearchParams({
        userId: profile.id,
        dateRange,
        ...(personaFilter !== "all" && { persona: personaFilter }),
        ...(hideTestUsers && { hideTestUsers: "true" }),
      })

      const response = await fetch(`/api/admin/visual-analytics?${params}`)
      const data = await response.json()

      if (response.status === 403) {
        setAccessDenied(true)
        toast.error(data.error)
        return
      }

      if (data.success) {
        setAnalytics(data.analytics)
        setAccessDenied(false)
        if (!isAutoRefresh) {
          toast.success("Analytics loaded successfully")
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleExportSnapshot = async () => {
    if (!analytics || !profile?.id) return

    try {
      const response = await fetch("/api/admin/visual-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export_snapshot",
          userId: profile.id,
          data: analytics,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Export generated successfully")
        // In a real implementation, trigger download
        console.log("Export data:", data.exportData)
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export data")
    }
  }

  const startVoiceInteraction = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processVoiceInput(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
      toast.success("Listening for your question...")
    } catch (error) {
      console.error("Failed to start voice interaction:", error)
      toast.error("Failed to access microphone")
    }
  }

  const stopVoiceInteraction = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    if (!analytics || !profile?.id) return

    try {
      // Generate voice summary based on current analytics
      const response = await fetch("/api/admin/visual-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "voice_summary",
          userId: profile.id,
          data: analytics,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setLastVoiceSummary(data.summary)
        await speakSummary(data.summary)
      }
    } catch (error) {
      console.error("Voice processing failed:", error)
      toast.error("Failed to process voice input")
    }
  }

  const speakSummary = async (text: string) => {
    setIsSpeaking(true)
    try {
      // In a real implementation, use ElevenLabs or similar TTS service
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Speech synthesis failed:", error)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading Giftverse Visual Analytics...</p>
          <p className="text-purple-300">Gathering intelligence signals...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-red-500/20 max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl">Access Restricted</CardTitle>
            <CardDescription className="text-red-200">
              Restricted access. Visual Giftverse is admin-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="border-red-500 text-red-300">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 max-w-md">
          <CardHeader className="text-center">
            <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <CardTitle className="text-white text-2xl">Awaiting Intelligence Signals...</CardTitle>
            <CardDescription className="text-purple-200">
              No analytics data available yet. The system is gathering intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => loadAnalytics()} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              Giftverse Visual Analytics
            </h1>
            <p className="text-purple-200">Real-time intelligence dashboard for AgentGift.ai ecosystem</p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
              {isRefreshing && (
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Refreshing
                </Badge>
              )}
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                Last updated: {new Date(analytics.metadata.generatedAt).toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Voice Interaction */}
            <Button
              onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
              disabled={isSpeaking}
              className={`${isListening ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}
            >
              <Mic className="h-4 w-4 mr-2" />
              {isListening ? "Stop Listening" : "Ask AI"}
            </Button>

            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                variant="outline"
                className="border-purple-500 text-purple-300 bg-transparent"
              >
                <VolumeX className="h-4 w-4 mr-2" />
                Stop Speaking
              </Button>
            )}

            <Button
              onClick={handleExportSnapshot}
              variant="outline"
              className="border-purple-500 text-purple-300 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Snapshot
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-300" />
                <Label className="text-purple-200">Date Range:</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32 bg-black/30 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-300" />
                <Label className="text-purple-200">Persona Filter:</Label>
                <Select value={personaFilter} onValueChange={setPersonaFilter}>
                  <SelectTrigger className="w-40 bg-black/30 border-purple-500/30 text-white">
                    <SelectValue placeholder="All personas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All personas</SelectItem>
                    <SelectItem value="tech-enthusiast">Tech Enthusiast</SelectItem>
                    <SelectItem value="wellness-seeker">Wellness Seeker</SelectItem>
                    <SelectItem value="adventurer">Adventurer</SelectItem>
                    <SelectItem value="creative-soul">Creative Soul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={hideTestUsers} onCheckedChange={setHideTestUsers} id="hide-test-users" />
                <Label htmlFor="hide-test-users" className="text-purple-200">
                  Hide test users
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Summary */}
        {lastVoiceSummary && (
          <Alert className="bg-purple-900/30 border-purple-500">
            <Volume2 className="h-4 w-4" />
            <AlertTitle className="text-purple-200">AI Voice Summary</AlertTitle>
            <AlertDescription className="text-purple-100 mt-2">{lastVoiceSummary}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* 1. User XP Overview */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                User XP Overview
              </CardTitle>
              <CardDescription className="text-purple-200">
                Total XP: {analytics.userXpOverview.totalXp.toLocaleString()} points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Users Bar Chart */}
                <div>
                  <h4 className="text-purple-200 font-medium mb-3">Top 10 Users by XP</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.userXpOverview.topUsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Bar dataKey="totalXp" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily XP Trend */}
                <div>
                  <h4 className="text-purple-200 font-medium mb-3">Daily XP Trend (30 days)</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={analytics.userXpOverview.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke={COLORS.secondary}
                        fill={COLORS.secondary}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Feature Usage Breakdown */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Feature Usage
              </CardTitle>
              <CardDescription className="text-purple-200">Top 5 most used features</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.featureUsage.topFeatures} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis type="category" dataKey="feature" stroke="#9CA3AF" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.accent} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Gift Interaction Heatmap */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-400" />
                Gift Interactions
              </CardTitle>
              <CardDescription className="text-purple-200">Most clicked gift categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={analytics.giftInteractions.heatmap}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="category"
                    dataKey="category"
                    stroke="#9CA3AF"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis type="number" dataKey="clicks" stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                    formatter={(value, name, props) => [
                      `${value} clicks`,
                      `Personas: ${props.payload.personas.join(", ")}`,
                    ]}
                  />
                  <Scatter dataKey="clicks" fill={COLORS.warning} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 4. Emotional Trends Feed */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                Emotional Trends
              </CardTitle>
              <CardDescription className="text-purple-200">Recent emotional patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Emotion Trends */}
                <div className="space-y-2">
                  {analytics.emotionalTrends.trends.slice(0, 6).map((trend, index) => (
                    <div key={trend.emotion} className="flex items-center justify-between p-2 bg-purple-900/30 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-purple-200 capitalize">{trend.emotion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{trend.count}</span>
                        {trend.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : trend.trend < 0 ? (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Emotions */}
                <div>
                  <h4 className="text-purple-200 font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {analytics.emotionalTrends.recent.slice(0, 5).map((emotion, index) => (
                      <div key={index} className="text-sm text-purple-300">
                        <span className="capitalize">{emotion.emotion_category}</span>
                        <span className="text-purple-400"> via {emotion.trigger_feature}</span>
                        <span className="text-purple-500 ml-2">
                          {new Date(emotion.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Voice Assistant Engagement */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5 text-indigo-400" />
                Voice Engagement
              </CardTitle>
              <CardDescription className="text-purple-200">
                Total sessions: {analytics.voiceEngagement.totalSessions}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.voiceEngagement.breakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sessions"
                    label={({ voice, percentage }) => `${voice}: ${percentage}%`}
                  >
                    {analytics.voiceEngagement.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Voice Stats */}
              <div className="mt-4 space-y-2">
                {analytics.voiceEngagement.breakdown.map((voice, index) => (
                  <div key={voice.voice} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-purple-200 capitalize">{voice.voice}</span>
                    </div>
                    <div className="text-purple-300">
                      {voice.sessions} sessions • {voice.avgDuration}s avg
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">System Intelligence Status</CardTitle>
            <CardDescription className="text-purple-200">
              Real-time data collection and processing metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.metadata.totalRecords.xp}</div>
                <div className="text-sm text-purple-300">XP Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.metadata.totalRecords.features}</div>
                <div className="text-sm text-purple-300">Feature Uses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.metadata.totalRecords.gifts}</div>
                <div className="text-sm text-purple-300">Gift Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.metadata.totalRecords.emotions}</div>
                <div className="text-sm text-purple-300">Emotional Tags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.metadata.totalRecords.voice}</div>
                <div className="text-sm text-purple-300">Voice Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
