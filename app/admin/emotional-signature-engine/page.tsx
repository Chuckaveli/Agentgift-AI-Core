"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  Brain,
  Heart,
  TrendingUp,
  Mail,
  Download,
  Search,
  Zap,
  Target,
  Settings,
  BarChart3,
  Activity,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react"

interface EmotionalSignature {
  id: string
  timestamp: string
  source_label: string
  sender_email: string
  parsed_emotion: string
  confidence_score: number
  context_label: string
  summary_snippet: string
  suggested_action: string
  processed: boolean
}

interface EmotionalAnalytics {
  emotions_tagged_week: number
  top_emotions: Array<{ emotion: string; count: number }>
  top_contexts: Array<{ context: string; count: number }>
  processing_accuracy: number
  webhook_success_rate: number
}

const EMOTION_COLORS = {
  joy: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sadness: "bg-blue-100 text-blue-800 border-blue-200",
  anger: "bg-red-100 text-red-800 border-red-200",
  fear: "bg-purple-100 text-purple-800 border-purple-200",
  surprise: "bg-green-100 text-green-800 border-green-200",
  disgust: "bg-gray-100 text-gray-800 border-gray-200",
  anxiety: "bg-orange-100 text-orange-800 border-orange-200",
  love: "bg-pink-100 text-pink-800 border-pink-200",
  grief: "bg-indigo-100 text-indigo-800 border-indigo-200",
  excitement: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const CONTEXT_ACTIONS = {
  Breakup: "Auto-route to LUMIENCE™",
  Graduation: "Flag for BondCraft™ ritual trigger",
  Grief: "Sync to Just-Because Gift Loop",
  Anniversary: "Flag for BondCraft™ ritual trigger",
  Illness: "Sync to Just-Because Gift Loop",
  Promotion: "Flag for BondCraft™ ritual trigger",
  Birthday: "Flag for BondCraft™ ritual trigger",
  Wedding: "Flag for BondCraft™ ritual trigger",
}

export default function EmotionalSignatureEnginePage() {
  const [signatures, setSignatures] = useState<EmotionalSignature[]>([])
  const [analytics, setAnalytics] = useState<EmotionalAnalytics>({
    emotions_tagged_week: 0,
    top_emotions: [],
    top_contexts: [],
    processing_accuracy: 0,
    webhook_success_rate: 0,
  })
  const [selectedSignature, setSelectedSignature] = useState<EmotionalSignature | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [emotionFilter, setEmotionFilter] = useState("all")
  const [contextFilter, setContextFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    fetchSignatures()
    fetchAnalytics()
  }, [])

  const fetchSignatures = async () => {
    try {
      const response = await fetch("/api/emotional-signatures")
      const data = await response.json()
      setSignatures(data.signatures || [])
    } catch (error) {
      toast.error("Failed to load emotional signatures")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/emotional-analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
  }

  const filteredSignatures = signatures.filter((signature) => {
    const matchesSearch =
      signature.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signature.summary_snippet.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmotion = emotionFilter === "all" || signature.parsed_emotion === emotionFilter
    const matchesContext = contextFilter === "all" || signature.context_label === contextFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      const signatureDate = new Date(signature.timestamp)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - signatureDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0
          break
        case "week":
          matchesDate = daysDiff <= 7
          break
        case "month":
          matchesDate = daysDiff <= 30
          break
      }
    }

    return matchesSearch && matchesEmotion && matchesContext && matchesDate
  })

  const exportToCSV = () => {
    const headers = ["Timestamp", "Source", "Sender", "Emotion", "Confidence", "Context", "Summary"]
    const csvContent = [
      headers.join(","),
      ...filteredSignatures.map((sig) =>
        [
          sig.timestamp,
          sig.source_label,
          sig.sender_email,
          sig.parsed_emotion,
          `${sig.confidence_score}%`,
          sig.context_label,
          `"${sig.summary_snippet.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `emotional-signatures-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getEmotionBadgeClass = (emotion: string) => {
    return (
      EMOTION_COLORS[emotion.toLowerCase() as keyof typeof EMOTION_COLORS] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-purple-100 shadow-sm">
          <div className="p-6 border-b border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">AgentGift.ai</h1>
                <p className="text-xs text-purple-600">Emotional Engine</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Engine Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Supabase</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Make.com</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Triggers
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Emotional Logs
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Gifting Contexts
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Processing Power</span>
              </div>
              <Progress value={analytics.processing_accuracy} className="h-2" />
              <p className="text-xs text-purple-700 mt-1">{analytics.processing_accuracy}% accuracy</p>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Emotional Signature Engine™
                </h1>
                <p className="text-gray-600 mt-1">AgentGift's Emotional Intelligence Layer (Private Use Only)</p>
              </div>
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-purple-100">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.emotions_tagged_week}</div>
                  <div className="text-sm text-gray-600">Emotions Tagged This Week</div>
                </CardContent>
              </Card>

              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Top Emotions</span>
                  </div>
                  <div className="space-y-2">
                    {analytics.top_emotions.slice(0, 3).map((emotion, index) => (
                      <div key={emotion.emotion} className="flex items-center justify-between">
                        <Badge variant="outline" className={getEmotionBadgeClass(emotion.emotion)}>
                          {emotion.emotion}
                        </Badge>
                        <span className="text-sm font-medium">{emotion.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Top Contexts</span>
                  </div>
                  <div className="space-y-2">
                    {analytics.top_contexts.slice(0, 3).map((context, index) => (
                      <div key={context.context} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{context.context}</span>
                        <span className="text-sm font-medium">{context.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.webhook_success_rate}%</div>
                  <div className="text-sm text-gray-600">Webhook Success Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 border-purple-100">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search emails or snippets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>

                  <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Emotions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Emotions</SelectItem>
                      {Object.keys(EMOTION_COLORS).map((emotion) => (
                        <SelectItem key={emotion} value={emotion}>
                          {emotion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={contextFilter} onValueChange={setContextFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Contexts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contexts</SelectItem>
                      {Object.keys(CONTEXT_ACTIONS).map((context) => (
                        <SelectItem key={context} value={context}>
                          {context}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Latest Emotional Tags ({filteredSignatures.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading emotional signatures...</div>
                ) : filteredSignatures.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No emotional signatures found matching your filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Sender Email</TableHead>
                          <TableHead>Emotion</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Context</TableHead>
                          <TableHead>Summary</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSignatures.map((signature) => (
                          <TableRow
                            key={signature.id}
                            className="cursor-pointer hover:bg-purple-50"
                            onClick={() => setSelectedSignature(signature)}
                          >
                            <TableCell className="font-mono text-sm">
                              {new Date(signature.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{signature.source_label}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{signature.sender_email}</TableCell>
                            <TableCell>
                              <Badge className={getEmotionBadgeClass(signature.parsed_emotion)}>
                                {signature.parsed_emotion}
                              </Badge>
                            </TableCell>
                            <TableCell className={getConfidenceColor(signature.confidence_score)}>
                              {signature.confidence_score}%
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{signature.context_label}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{signature.summary_snippet}</TableCell>
                            <TableCell>
                              {signature.processed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white border-l border-purple-100 overflow-auto">
          {selectedSignature ? (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Emotional Analysis</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Context</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-800">
                    {selectedSignature.summary_snippet}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Emotional Profile</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primary Emotion</span>
                      <Badge className={getEmotionBadgeClass(selectedSignature.parsed_emotion)}>
                        {selectedSignature.parsed_emotion}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence Score</span>
                      <span className={`font-medium ${getConfidenceColor(selectedSignature.confidence_score)}`}>
                        {selectedSignature.confidence_score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Context Label</span>
                      <Badge variant="secondary">{selectedSignature.context_label}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Suggested Internal Action</Label>
                  <div className="mt-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">
                        {CONTEXT_ACTIONS[selectedSignature.context_label as keyof typeof CONTEXT_ACTIONS] ||
                          selectedSignature.suggested_action}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Based on the emotional signature and context, this interaction should be routed to the appropriate
                      AgentGift.ai system for optimal gift recommendation.
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Processing Details</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source</span>
                      <span className="font-medium">{selectedSignature.source_label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed</span>
                      <span className={selectedSignature.processed ? "text-green-600" : "text-yellow-600"}>
                        {selectedSignature.processed ? "Yes" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp</span>
                      <span className="font-mono text-xs">
                        {new Date(selectedSignature.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Process Action
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Select an Emotional Signature</h3>
              <p className="text-sm text-gray-600">
                Click on any row in the table to view detailed emotional analysis and suggested actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
