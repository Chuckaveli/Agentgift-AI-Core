"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Search,
  Mic,
  MicOff,
  VolumeX,
  Filter,
  Download,
  RefreshCw,
  Brain,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Gift,
  MessageSquare,
  FileText,
  Sparkles,
  Archive,
  Clock,
  Target,
  Zap,
  Eye,
  BarChart3,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface MemoryResult {
  id: string
  type: "memory" | "interaction" | "feedback" | "gift_interaction"
  source_table: string
  user_id?: string
  emotional_context?: string
  memory_content?: string
  command_input?: string
  response_output?: string
  feedback_message?: string
  sentiment?: string
  sentiment_score?: number
  reaction_score?: number
  created_at?: string
  logged_at?: string
  tags?: string[]
  source?: string
  relevance_score?: number
}

interface SearchFilters {
  emotion: string
  dateStart: string
  dateEnd: string
  feature: string
  type: string
  intensity: string
}

export default function MemoryVaultPage() {
  const { profile, loading, error, isAdmin } = useUser()
  const router = useRouter()

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MemoryResult[]>([])
  const [searchSummary, setSummary] = useState("")
  const [searchSuggestions, setSuggestions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [searchDuration, setSearchDuration] = useState(0)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    emotion: "all",
    dateStart: "",
    dateEnd: "",
    feature: "all",
    type: "all",
    intensity: "all",
  })

  // Insights state
  const [insights, setInsights] = useState<any>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  // Session state
  const [sessionId] = useState(`memory_vault_${Date.now()}`)
  const [sessionQueries, setSessionQueries] = useState<string[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Authentication check
  useEffect(() => {
    if (!loading && (!profile || !isAdmin)) {
      toast.error("Restricted access. Only Giftverse Admins may access the Memory Vault.")
      router.push("/dashboard")
    }
  }, [profile, loading, isAdmin, router])

  // Load initial insights
  useEffect(() => {
    if (isAdmin && profile?.id) {
      loadInsights()
    }
  }, [isAdmin, profile?.id])

  const loadInsights = async () => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch(`/api/admin/memory-vault/insights?adminId=${profile?.id}&daysBack=30`)
      const data = await response.json()

      if (data.success) {
        setInsights(data.insights)
      }
    } catch (error) {
      console.error("Failed to load insights:", error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const executeSearch = async (query: string = searchQuery, searchType = "natural_language") => {
    if (!query.trim() && searchType !== "filter") {
      toast.error("Please enter a search query")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch("/api/admin/memory-vault/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          searchType,
          filters:
            filters.emotion !== "all" || filters.feature !== "all" || filters.dateStart || filters.dateEnd
              ? filters
              : {},
          adminId: profile?.id,
          isVoiceQuery: searchType === "voice",
          limit: 100,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSearchResults(data.results || [])
        setSummary(data.summary || "")
        setSuggestions(data.suggestions || [])
        setTotalResults(data.totalCount || 0)
        setSearchDuration(data.searchDuration || 0)

        // Add to session queries
        setSessionQueries((prev) => [query, ...prev.slice(0, 4)])

        toast.success(`Found ${data.totalCount} memories in ${data.searchDuration}ms`)
      } else {
        toast.error(data.error || "Search failed")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search memory vault")
    } finally {
      setIsSearching(false)
    }
  }

  const startVoiceSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        // Simulate voice recognition for demo
        const demoQueries = [
          "Show me all romantic gift searches from Valentine's week",
          "When did users last express sadness about gift failures?",
          "Find successful BondCraft rituals with high joy ratings",
          "What anxiety patterns emerged during holiday season?",
          "Show gift clicks with frustration tags this month",
        ]

        const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)]
        setTranscript(randomQuery)
        setSearchQuery(randomQuery)

        // Execute the search
        await executeSearch(randomQuery, "voice")

        // Generate AI response
        const response = `I found memories related to "${randomQuery}". Processing ${totalResults} results from the emotional memory vault. Would you like me to analyze patterns or generate insights from these findings?`
        setAiResponse(response)
        await speakResponse(response)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
      toast.success("Listening for memory query...")
    } catch (error) {
      console.error("Voice search error:", error)
      toast.error("Failed to access microphone")
    }
  }

  const stopVoiceSearch = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const speakResponse = async (text: string) => {
    setIsSpeaking(true)
    try {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        utterance.onend = () => setIsSpeaking(false)
        speechSynthesis.speak(utterance)
      } else {
        setTimeout(() => setIsSpeaking(false), 3000)
      }
    } catch (error) {
      console.error("Speech error:", error)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const handleFilterSearch = () => {
    executeSearch("", "filter")
  }

  const clearFilters = () => {
    setFilters({
      emotion: "all",
      dateStart: "",
      dateEnd: "",
      feature: "all",
      type: "all",
      intensity: "all",
    })
  }

  const exportResults = async () => {
    if (searchResults.length === 0) {
      toast.error("No results to export")
      return
    }

    try {
      const response = await fetch("/api/admin/memory-vault/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_report",
          adminId: profile?.id,
          insightData: {
            title: `Memory Vault Search Results - ${new Date().toLocaleDateString()}`,
            summary: searchSummary,
            results: searchResults,
            query: searchQuery,
            totalResults,
            searchDuration,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Report generated successfully")
        // In a real implementation, this would trigger a download
        console.log("Report:", data.result)
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export results")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      Joy: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Love: "bg-pink-100 text-pink-800 border-pink-200",
      Sadness: "bg-blue-100 text-blue-800 border-blue-200",
      Anxiety: "bg-purple-100 text-purple-800 border-purple-200",
      Anger: "bg-red-100 text-red-800 border-red-200",
      Excitement: "bg-orange-100 text-orange-800 border-orange-200",
      Frustration: "bg-gray-100 text-gray-800 border-gray-200",
      Gratitude: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[emotion as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "memory":
        return <Brain className="w-4 h-4" />
      case "interaction":
        return <MessageSquare className="w-4 h-4" />
      case "feedback":
        return <Heart className="w-4 h-4" />
      case "gift_interaction":
        return <Gift className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-purple-200">Accessing Memory Vault...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Emotional Memory Vault
              </h1>
              <p className="text-purple-200">AI-Powered Memory Recall & Analysis • Welcome, {profile?.name}</p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="border-purple-400 text-purple-300">
              <Brain className="h-3 w-3 mr-1" />
              {totalResults} Memories Found
            </Badge>
            <Badge variant="outline" className="border-pink-400 text-pink-300">
              <Clock className="h-3 w-3 mr-1" />
              {searchDuration}ms Search Time
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-300">
              <Target className="h-3 w-3 mr-1" />
              {sessionQueries.length} Session Queries
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm">
            <TabsTrigger value="search" className="data-[state=active]:bg-purple-600">
              <Search className="h-4 w-4 mr-2" />
              Memory Search
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-purple-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Interface */}
              <Card className="lg:col-span-2 bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Memory Search Interface
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Ask: "What memory would you like to recall?"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Voice Search */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                      disabled={isSearching || isSpeaking}
                      className={`${
                        isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                      } text-white`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Search
                        </>
                      )}
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
                  </div>

                  {/* Text Search */}
                  <div className="space-y-2">
                    <Label className="text-purple-200">Natural Language Search:</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., 'Show all romantic gift searches from Valentine's week'"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            executeSearch()
                          }
                        }}
                      />
                      <Button
                        onClick={() => executeSearch()}
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Search Examples */}
                  <div className="space-y-2">
                    <Label className="text-purple-200 text-sm">Quick Examples:</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Failed gift suggestions with frustration",
                        "BondCraft rituals with high joy",
                        "Anxiety patterns during holidays",
                        "Successful LUMIENCE interactions",
                      ].map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery(example)
                            executeSearch(example)
                          }}
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20 text-xs"
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Interaction Display */}
                  {(transcript || aiResponse) && (
                    <div className="space-y-3 pt-4 border-t border-purple-500/20">
                      {transcript && (
                        <div className="space-y-1">
                          <Label className="text-blue-300 text-xs">Voice Query:</Label>
                          <div className="bg-blue-900/30 p-2 rounded text-blue-200 text-sm">{transcript}</div>
                        </div>
                      )}
                      {aiResponse && (
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-xs">AI Response:</Label>
                          <div className="bg-purple-900/30 p-2 rounded text-purple-200 text-sm">{aiResponse}</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Filters Panel */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Emotion Filter */}
                  <div className="space-y-2">
                    <Label className="text-purple-200">🎭 Emotion:</Label>
                    <Select
                      value={filters.emotion}
                      onValueChange={(value) => setFilters({ ...filters, emotion: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Emotions</SelectItem>
                        <SelectItem value="Joy">Joy</SelectItem>
                        <SelectItem value="Love">Love</SelectItem>
                        <SelectItem value="Sadness">Sadness</SelectItem>
                        <SelectItem value="Anxiety">Anxiety</SelectItem>
                        <SelectItem value="Anger">Anger</SelectItem>
                        <SelectItem value="Excitement">Excitement</SelectItem>
                        <SelectItem value="Frustration">Frustration</SelectItem>
                        <SelectItem value="Gratitude">Gratitude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-purple-200">🕰️ Date Range:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={filters.dateStart}
                        onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                        className="bg-black/30 border-purple-500/30 text-white"
                      />
                      <Input
                        type="date"
                        value={filters.dateEnd}
                        onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                        className="bg-black/30 border-purple-500/30 text-white"
                      />
                    </div>
                  </div>

                  {/* Feature Filter */}
                  <div className="space-y-2">
                    <Label className="text-purple-200">🧪 Feature:</Label>
                    <Select
                      value={filters.feature}
                      onValueChange={(value) => setFilters({ ...filters, feature: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Features</SelectItem>
                        <SelectItem value="bondcraft">BondCraft™</SelectItem>
                        <SelectItem value="lumience">LUMIENCE™</SelectItem>
                        <SelectItem value="agent_gifty">Agent Gifty™</SelectItem>
                        <SelectItem value="ghost_hunt">Ghost Hunt</SelectItem>
                        <SelectItem value="serendipity">Serendipity</SelectItem>
                        <SelectItem value="smart_search">Smart Search</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFilterSearch}
                      disabled={isSearching}
                      className="bg-purple-600 hover:bg-purple-700 flex-1"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-purple-500 text-purple-300 bg-transparent"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Session History */}
                  {sessionQueries.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-purple-500/20">
                      <Label className="text-purple-200 text-sm">Recent Queries:</Label>
                      <div className="space-y-1">
                        {sessionQueries.map((query, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSearchQuery(query)
                              executeSearch(query)
                            }}
                            className="w-full text-left justify-start text-purple-300 hover:bg-purple-600/20 text-xs"
                          >
                            <Clock className="h-3 w-3 mr-2" />
                            {query.length > 30 ? `${query.substring(0, 30)}...` : query}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Memory Results ({totalResults})
                      </CardTitle>
                      <CardDescription className="text-purple-200 mt-2">{searchSummary}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={exportResults}
                        variant="outline"
                        size="sm"
                        className="border-purple-500 text-purple-300 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        onClick={() => executeSearch()}
                        variant="outline"
                        size="sm"
                        className="border-purple-500 text-purple-300 bg-transparent"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {searchResults.map((result, index) => (
                        <div key={result.id || index} className="border border-purple-500/20 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(result.type)}
                              <Badge variant="outline" className="text-xs capitalize">
                                {result.type.replace("_", " ")}
                              </Badge>
                              {result.source && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.source}
                                </Badge>
                              )}
                              {result.relevance_score && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(result.relevance_score * 100)}% match
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {result.emotional_context && (
                                <Badge className={`text-xs ${getEmotionColor(result.emotional_context)}`}>
                                  {result.emotional_context}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(result.created_at || result.logged_at || "")}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm text-gray-300">
                            {result.memory_content ||
                              result.command_input ||
                              result.feedback_message ||
                              "No content available"}
                          </div>

                          {result.response_output && (
                            <div className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded">
                              Response: {result.response_output}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              {result.sentiment_score !== undefined && (
                                <span
                                  className={`${result.sentiment_score > 0 ? "text-green-400" : result.sentiment_score < 0 ? "text-red-400" : "text-gray-400"}`}
                                >
                                  Sentiment: {result.sentiment_score > 0 ? "+" : ""}
                                  {result.sentiment_score?.toFixed(2)}
                                </span>
                              )}
                              {result.reaction_score && (
                                <span className="text-blue-400">Reaction: {result.reaction_score}/10</span>
                              )}
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {result.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span>Table: {result.source_table}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Search Suggestions */}
                  {searchSuggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <Label className="text-purple-200 text-sm mb-2 block">💡 Suggested Actions:</Label>
                      <div className="flex flex-wrap gap-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (suggestion.includes("Export")) {
                                exportResults()
                              } else if (suggestion.includes("insights")) {
                                // Switch to insights tab
                                document.querySelector('[value="insights"]')?.click()
                              } else {
                                setSearchQuery(suggestion)
                                executeSearch(suggestion)
                              }
                            }}
                            className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20 text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {searchResults.length === 0 && !isSearching && (
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="text-center py-12">
                  <Archive className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">Memory Vault Ready</h3>
                  <p className="text-purple-200 mb-6">
                    Search across all user emotions, interactions, and gifting memories using natural language or voice
                    commands.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => setSearchQuery("Show me recent emotional patterns")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Explore Patterns
                    </Button>
                    <Button
                      onClick={startVoiceSearch}
                      variant="outline"
                      className="border-purple-500 text-purple-300 bg-transparent"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Memory Insights & Analytics
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      AI-generated patterns and recommendations from the memory vault
                    </CardDescription>
                  </div>
                  <Button
                    onClick={loadInsights}
                    disabled={isLoadingInsights}
                    variant="outline"
                    className="border-purple-500 text-purple-300 bg-transparent"
                  >
                    {isLoadingInsights ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Insights
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInsights ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-purple-200">Analyzing memory patterns...</p>
                  </div>
                ) : insights ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Emotional Patterns */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-400" />
                        Emotional Patterns
                      </h3>
                      <div className="space-y-2">
                        {insights.emotional_patterns?.slice(0, 5).map((pattern: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={getEmotionColor(pattern.emotion)}>{pattern.emotion}</Badge>
                              <span className="text-sm text-purple-200">{pattern.count} instances</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Avg: {pattern.avgIntensity?.toFixed(1)}</span>
                              {pattern.trend === "increasing" ? (
                                <TrendingUp className="h-4 w-4 text-green-400" />
                              ) : pattern.trend === "decreasing" ? (
                                <TrendingDown className="h-4 w-4 text-red-400" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gifting Trends */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-400" />
                        Gifting Trends
                      </h3>
                      <div className="space-y-2">
                        {insights.gifting_trends?.slice(0, 5).map((trend: any, index: number) => (
                          <div key={index} className="p-3 bg-green-900/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-white">{trend.category}</span>
                              <Badge variant="outline" className="text-xs">
                                {trend.avgReactionScore?.toFixed(1)}/10
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>
                                {trend.views} views • {trend.clicks} clicks
                              </span>
                              <span>{trend.conversionRate?.toFixed(1)}% conversion</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Anomalies */}
                    {insights.anomalies?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          Detected Anomalies
                        </h3>
                        <div className="space-y-2">
                          {insights.anomalies.slice(0, 3).map((anomaly: any, index: number) => (
                            <Alert key={index} className="border-yellow-500 bg-yellow-900/20">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="text-yellow-200">
                                {anomaly.emotion} Spike - {anomaly.date}
                              </AlertTitle>
                              <AlertDescription className="text-yellow-100">
                                {anomaly.userCount} users affected. Anomaly score: {anomaly.anomalyScore?.toFixed(1)}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Zap className="h-5 w-5 text-blue-400" />
                          AI Recommendations
                        </h3>
                        <div className="space-y-3">
                          {insights.recommendations.map((rec: any, index: number) => (
                            <div key={index} className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/20">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-white">{rec.title}</h4>
                                <Badge
                                  variant={
                                    rec.priority === "high"
                                      ? "destructive"
                                      : rec.priority === "medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-blue-200 mb-3">{rec.description}</p>
                              {rec.actionItems && (
                                <div className="space-y-1">
                                  {rec.actionItems.slice(0, 2).map((item: string, itemIndex: number) => (
                                    <div key={itemIndex} className="text-xs text-blue-300 flex items-center gap-2">
                                      <div className="w-1 h-1 bg-blue-400 rounded-full" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-purple-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No insights available yet</p>
                    <p className="text-sm mt-2">Perform some searches to generate insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Memory Patterns & Trends
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Long-term patterns and behavioral trends from the memory vault
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-purple-400">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Pattern Analysis</h3>
                  <p className="mb-6">Advanced pattern recognition and trend analysis coming soon</p>
                  <Button
                    onClick={() => document.querySelector('[value="search"]')?.click()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Start Searching
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export & Reports
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Generate comprehensive reports and export memory data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-purple-400">
                  <Download className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Export Center</h3>
                  <p className="mb-6">Advanced export and reporting features coming soon</p>
                  <Button
                    onClick={exportResults}
                    disabled={searchResults.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Current Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session End Prompt */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-purple-400" />
                <span className="text-purple-200">
                  🗣️ "Would you like to store this insight in the vault or mark it as noise?"
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-300 hover:bg-green-600/20 bg-transparent"
                >
                  Store Insight
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-500 text-gray-300 hover:bg-gray-600/20 bg-transparent"
                >
                  Mark as Noise
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 italic border-t border-purple-500/30 pt-4">
          "Every memory tells a story. Every pattern reveals truth. The vault remembers all."
        </div>
      </div>
    </div>
  )
}
