"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { createClient } from "@/lib/supabase-client"
import { Download, RefreshCw, Search, Send, X } from "lucide-react"

// Initialize Supabase client
const supabase = createClient()

// Emotion colors
const EMOTION_COLORS = {
  Joy: "#FFD700",
  Sadness: "#6495ED",
  Anger: "#FF4500",
  Fear: "#800080",
  Disgust: "#008000",
  Surprise: "#FFA500",
  Trust: "#4682B4",
  Anticipation: "#FF69B4",
  Love: "#FF1493",
  Grief: "#000080",
  Anxiety: "#9370DB",
  Excitement: "#FF6347",
  Gratitude: "#2E8B57",
  Guilt: "#8B4513",
  Pride: "#DAA520",
  Shame: "#A52A2A",
  Contentment: "#87CEEB",
  Disappointment: "#778899",
  Jealousy: "#006400",
  Hope: "#00BFFF",
  default: "#718096",
}

// Context routing systems
const CONTEXT_ROUTING = {
  Breakup: "LUMIENCE™",
  Grief: "Just-Because Gift Loop",
  Anxiety: "LUMIENCE™",
  Depression: "LUMIENCE™",
  "Job Loss": "LUMIENCE™",
  Graduation: "BondCraft™",
  Anniversary: "BondCraft™",
  Promotion: "BondCraft™",
  Birthday: "BondCraft™",
  Wedding: "BondCraft™",
  "New Baby": "BondCraft™",
  Celebration: "BondCraft™",
  Illness: "Just-Because Gift Loop",
  Moving: "Just-Because Gift Loop",
  Apology: "Just-Because Gift Loop",
  default: "General",
}

export default function EmotionalSignatureEngine() {
  // State
  const [activeTab, setActiveTab] = useState("dashboard")
  const [signatures, setSignatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSignature, setSelectedSignature] = useState(null)
  const [emotionStats, setEmotionStats] = useState([])
  const [contextStats, setContextStats] = useState([])
  const [totalSignatures, setTotalSignatures] = useState(0)
  const [filters, setFilters] = useState({
    emotion: "all",
    context: "all",
    date: "week",
    search: "",
  })

  // Router
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchSignatures()
    fetchStats()
  }, [filters])

  // Fetch emotional signatures
  async function fetchSignatures() {
    setLoading(true)
    try {
      const { emotion, context, date, search } = filters

      let query = supabase.from("emotional_signatures").select("*").order("timestamp", { ascending: false }).limit(50)

      // Apply filters
      if (emotion !== "all") {
        query = query.eq("parsed_emotion", emotion)
      }

      if (context !== "all") {
        query = query.eq("context_label", context)
      }

      // Apply date filter
      if (date !== "all") {
        const now = new Date()
        let startDate

        switch (date) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0))
            break
          case "week":
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 7)
            break
          case "month":
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 30)
            break
          case "quarter":
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 90)
            break
          default:
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 7)
        }

        query = query.gte("timestamp", startDate.toISOString())
      }

      // Apply search filter
      if (search) {
        query = query.or(`sender_email.ilike.%${search}%,summary_snippet.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching signatures:", error)
        return
      }

      setSignatures(data || [])
      setTotalSignatures(count || 0)

      // Select first signature if none selected
      if (data && data.length > 0 && !selectedSignature) {
        setSelectedSignature(data[0])
      }
    } catch (error) {
      console.error("Error in fetchSignatures:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  async function fetchStats() {
    try {
      // Get date range based on filter
      const now = new Date()
      let startDate

      switch (filters.date) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 30)
          break
        case "quarter":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 90)
          break
        default:
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
      }

      // Fetch emotion stats
      const { data: emotionData, error: emotionError } = await supabase
        .from("emotional_signatures")
        .select("parsed_emotion, count")
        .gte("timestamp", startDate.toISOString())
        .group("parsed_emotion")
        .order("count", { ascending: false })

      if (emotionError) {
        console.error("Error fetching emotion stats:", emotionError)
      } else {
        setEmotionStats(
          emotionData.map((item) => ({
            name: item.parsed_emotion,
            value: item.count,
            color: EMOTION_COLORS[item.parsed_emotion] || EMOTION_COLORS.default,
          })),
        )
      }

      // Fetch context stats
      const { data: contextData, error: contextError } = await supabase
        .from("emotional_signatures")
        .select("context_label, count")
        .gte("timestamp", startDate.toISOString())
        .group("context_label")
        .order("count", { ascending: false })

      if (contextError) {
        console.error("Error fetching context stats:", contextError)
      } else {
        setContextStats(
          contextData.map((item) => ({
            name: item.context_label,
            value: item.count,
          })),
        )
      }
    } catch (error) {
      console.error("Error in fetchStats:", error)
    }
  }

  // Handle filter changes
  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Handle signature selection
  function handleSignatureSelect(signature) {
    setSelectedSignature(signature)
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // Get confidence color
  function getConfidenceColor(score) {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-green-400"
    if (score >= 60) return "bg-yellow-400"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Get emotion color
  function getEmotionColor(emotion) {
    return EMOTION_COLORS[emotion] || EMOTION_COLORS.default
  }

  // Get routing system
  function getRoutingSystem(context) {
    return CONTEXT_ROUTING[context] || CONTEXT_ROUTING.default
  }

  // Export data as CSV
  function exportCSV() {
    if (signatures.length === 0) return

    const headers = [
      "ID",
      "Timestamp",
      "Source",
      "Email",
      "Emotion",
      "Confidence",
      "Context",
      "Summary",
      "Suggested Action",
    ]

    const csvData = signatures.map((sig) => [
      sig.id,
      sig.timestamp,
      sig.source_label,
      sig.sender_email,
      sig.parsed_emotion,
      sig.confidence_score,
      sig.context_label,
      sig.summary_snippet,
      sig.suggested_action || "",
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `emotional-signatures-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-purple-700">Emotional Signature Engine™</h2>
          <p className="text-xs text-gray-500">AgentGift's Emotional Intelligence Layer</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeTab === "dashboard" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="mr-2">📥</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeTab === "logs" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            <span className="mr-2">📊</span>
            <span>Emotional Logs</span>
          </button>

          <button
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeTab === "contexts" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("contexts")}
          >
            <span className="mr-2">🎯</span>
            <span>Gifting Contexts</span>
          </button>

          <button
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeTab === "insights" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("insights")}
          >
            <span className="mr-2">🧠</span>
            <span>Insights</span>
          </button>

          <button
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeTab === "settings" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="mr-2">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">WEBHOOK STATUS</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">MAKE.COM</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emotional Signature Engine™</h1>
              <p className="text-sm text-gray-500">AgentGift's Emotional Intelligence Layer (Private Use Only)</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchSignatures}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>

              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Emotions Tagged</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalSignatures}</div>
                      <p className="text-xs text-gray-500">
                        {filters.date === "today"
                          ? "Today"
                          : filters.date === "week"
                            ? "This Week"
                            : filters.date === "month"
                              ? "This Month"
                              : filters.date === "quarter"
                                ? "This Quarter"
                                : "All Time"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Top Emotions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {emotionStats.slice(0, 3).map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: emotion.color }} />
                            <span className="text-sm">{emotion.name}</span>
                          </div>
                          <span className="text-sm font-medium">{emotion.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Top Contexts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {contextStats.slice(0, 3).map((context, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{context.name}</span>
                          <span className="text-sm font-medium">{context.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Emotion Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ChartContainer
                        config={{
                          emotion: {
                            label: "Emotions",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={emotionStats}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={(entry) => entry.name}
                            >
                              {emotionStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Context Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ChartContainer
                        config={{
                          context: {
                            label: "Contexts",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={contextStats.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" name="Count" fill="hsl(var(--chart-2))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters and Table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Latest Emotional Tags</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Select value={filters.date} onValueChange={(value) => handleFilterChange("date", value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Date Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filters.emotion} onValueChange={(value) => handleFilterChange("emotion", value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Emotion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Emotions</SelectItem>
                            <SelectItem value="Joy">Joy</SelectItem>
                            <SelectItem value="Sadness">Sadness</SelectItem>
                            <SelectItem value="Anger">Anger</SelectItem>
                            <SelectItem value="Fear">Fear</SelectItem>
                            <SelectItem value="Love">Love</SelectItem>
                            <SelectItem value="Grief">Grief</SelectItem>
                            <SelectItem value="Anxiety">Anxiety</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filters.context} onValueChange={(value) => handleFilterChange("context", value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Context" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Contexts</SelectItem>
                            <SelectItem value="Breakup">Breakup</SelectItem>
                            <SelectItem value="Grief">Grief</SelectItem>
                            <SelectItem value="Graduation">Graduation</SelectItem>
                            <SelectItem value="Birthday">Birthday</SelectItem>
                            <SelectItem value="Anniversary">Anniversary</SelectItem>
                            <SelectItem value="Illness">Illness</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-8 w-[200px]"
                            placeholder="Search..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Emotion</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Context</TableHead>
                            <TableHead>Summary</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4">
                                Loading...
                              </TableCell>
                            </TableRow>
                          ) : signatures.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4">
                                No emotional signatures found
                              </TableCell>
                            </TableRow>
                          ) : (
                            signatures.map((signature) => (
                              <TableRow
                                key={signature.id}
                                className={`cursor-pointer ${
                                  selectedSignature?.id === signature.id ? "bg-purple-50" : ""
                                }`}
                                onClick={() => handleSignatureSelect(signature)}
                              >
                                <TableCell>{formatDate(signature.timestamp)}</TableCell>
                                <TableCell>{signature.source_label}</TableCell>
                                <TableCell>{signature.sender_email}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{
                                        backgroundColor: getEmotionColor(signature.parsed_emotion),
                                      }}
                                    />
                                    {signature.parsed_emotion}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className={`h-2 rounded-full ${getConfidenceColor(signature.confidence_score)}`}
                                        style={{ width: `${signature.confidence_score}%` }}
                                      />
                                    </div>
                                    <span className="text-xs">{signature.confidence_score}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>{signature.context_label}</TableCell>
                                <TableCell className="max-w-xs truncate">{signature.summary_snippet}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Emotional Logs</CardTitle>
                    <CardDescription>Complete history of emotional signatures detected by AgentGift.ai</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Logs content */}
                    <div className="text-center py-8 text-gray-500">Detailed logs view coming soon</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "contexts" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gifting Contexts</CardTitle>
                    <CardDescription>Configure and manage emotional contexts for gift recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Contexts content */}
                    <div className="text-center py-8 text-gray-500">Gifting contexts configuration coming soon</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Insights</CardTitle>
                    <CardDescription>Advanced analytics and insights from emotional data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Insights content */}
                    <div className="text-center py-8 text-gray-500">Advanced insights dashboard coming soon</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Configure the Emotional Signature Engine™</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Settings content */}
                    <div className="text-center py-8 text-gray-500">Settings configuration coming soon</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Panel */}
          {selectedSignature && (
            <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium">Emotional Preview</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedSignature(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Timestamp</Label>
                    <p className="text-sm">{formatDate(selectedSignature.timestamp)}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Source</Label>
                    <p className="text-sm">{selectedSignature.source_label}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="text-sm">{selectedSignature.sender_email}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Emotion</Label>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: getEmotionColor(selectedSignature.parsed_emotion),
                        }}
                      />
                      <p className="text-sm">{selectedSignature.parsed_emotion}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Confidence</Label>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getConfidenceColor(selectedSignature.confidence_score)}`}
                          style={{ width: `${selectedSignature.confidence_score}%` }}
                        />
                      </div>
                      <span className="text-xs">{selectedSignature.confidence_score}%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Context</Label>
                    <p className="text-sm">{selectedSignature.context_label}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Summary</Label>
                    <p className="text-sm">{selectedSignature.summary_snippet}</p>
                  </div>

                  {selectedSignature.raw_content && (
                    <div>
                      <Label className="text-xs text-gray-500">Full Content</Label>
                      <ScrollArea className="h-24 rounded border border-gray-200 p-2 mt-1">
                        <p className="text-xs">{selectedSignature.raw_content}</p>
                      </ScrollArea>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-xs text-gray-500">Suggested Internal Action</Label>
                    <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                      {selectedSignature.suggested_action ? (
                        <p className="text-sm">{selectedSignature.suggested_action}</p>
                      ) : (
                        <p className="text-sm text-gray-500">No action suggested</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Routing System</Label>
                    <Badge className="mt-1" variant="outline">
                      {getRoutingSystem(selectedSignature.context_label)}
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Apply Suggested Action
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
