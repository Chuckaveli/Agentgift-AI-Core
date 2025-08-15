"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Brain,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  TrendingUp,
  Settings,
  MessageSquare,
  Heart,
  BarChart3,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface EmotionalTrend {
  date: string
  joy: number
  gratitude: number
  excitement: number
  love: number
  neutral: number
}

interface FeatureUsageSummary {
  total_features: number
  top_features: Array<{ name: string; count: number }>
  xp_total: number
}

export default function GiftverseLeaderBot() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [galenResponse, setGalenResponse] = useState("")
  const [sessionId] = useState(() => `giftverse-leader-${Date.now()}`)

  // Panel States
  const [botControlData, setBotControlData] = useState({
    bot_name: "",
    new_logic: "",
  })
  const [usageSummary, setUsageSummary] = useState<FeatureUsageSummary | null>(null)
  const [rewardTestData, setRewardTestData] = useState({
    user_id: "",
    feature: "",
    xp: 0,
  })
  const [voiceQuery, setVoiceQuery] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [emotionalTrends, setEmotionalTrends] = useState<EmotionalTrend[]>([])
  const [topMood, setTopMood] = useState("")

  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    initializeSession()
    loadDashboardData()

    // Galen's specialized greeting for Leader Bot
    if (voiceEnabled) {
      setTimeout(() => {
        speakText(
          "Welcome to the Giftverse Leader Bot, Agent. I am your strategic intelligence companion, ready to analyze the platform's neural pathways and optimize our gifting ecosystem. How shall we enhance the Giftverse today?",
        )
      }, 1000)
    }
  }, [])

  const initializeSession = async () => {
    // Mock admin user - in real app, get from auth
    setAdminUser({
      id: "admin-leader-001",
      name: "Sarah Chen",
      email: "sarah@agentgift.ai",
      role: "founder",
    })
  }

  const loadDashboardData = async () => {
    try {
      // Load usage summary
      const usageData = await executeFunction("log_feature_usage_summary", {})
      if (usageData) {
        setUsageSummary(usageData)
      }

      // Load emotional trends
      const emotionalData = await executeFunction("get_emotional_summary", {})
      if (emotionalData) {
        setEmotionalTrends(emotionalData.trend_data || [])
        setTopMood(emotionalData.top_mood || "neutral")
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast({
        title: "Data Load Error",
        description: "Failed to load some dashboard data. Please refresh.",
        variant: "destructive",
      })
    }
  }

  const executeFunction = async (functionName: string, parameters: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/giftverse-leader/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: functionName,
          parameters,
          session_id: sessionId,
          admin_id: adminUser?.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Function Executed",
          description: `Successfully executed: ${functionName}`,
        })

        if (voiceEnabled && data.voice_response) {
          speakText(data.voice_response)
        }

        return data.result
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Function execution error:", error)
      toast({
        title: "Function Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const startVoiceRecording = async () => {
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
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result?.toString().split(",")[1]
          if (base64Audio) {
            processVoiceQuery(base64Audio)
          }
        }
        reader.readAsDataURL(audioBlob)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopVoiceRecording()
        }
      }, 10000)
    } catch (error) {
      console.error("Voice recording error:", error)
      toast({
        title: "Voice Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setIsListening(false)
  }

  const processVoiceQuery = async (audioData: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/giftverse-leader/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "voice_ai_query",
          audioData,
          sessionId,
          adminId: adminUser?.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCurrentTranscript(data.transcript)
        setAiResponse(data.reply_text)
        setGalenResponse(data.galen_response)

        if (voiceEnabled && data.reply_text) {
          speakText(data.reply_text)
        }
      }
    } catch (error) {
      console.error("Voice processing error:", error)
      toast({
        title: "Voice Processing Error",
        description: "Failed to process voice command.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const speakText = async (text: string) => {
    try {
      const response = await fetch("/api/admin/giftverse-leader/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "text_to_speech",
          textInput: text,
          sessionId,
          adminId: adminUser?.id,
        }),
      })

      const data = await response.json()
      if (data.success && audioRef.current) {
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioData), (c) => c.charCodeAt(0))], {
          type: "audio/wav",
        })
        const audioUrl = URL.createObjectURL(audioBlob)
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }
    } catch (error) {
      console.error("Text-to-speech error:", error)
    }
  }

  const handleUpdateAssistantBrain = async () => {
    if (!botControlData.bot_name || !botControlData.new_logic) {
      toast({
        title: "Missing Information",
        description: "Please provide bot name and logic update.",
        variant: "destructive",
      })
      return
    }

    const result = await executeFunction("update_assistant_brain", botControlData)
    if (result) {
      setBotControlData({ bot_name: "", new_logic: "" })
    }
  }

  const handleRewardTest = async () => {
    if (!rewardTestData.user_id || !rewardTestData.feature) {
      toast({
        title: "Missing Information",
        description: "Please provide user ID and feature name.",
        variant: "destructive",
      })
      return
    }

    const result = await executeFunction("trigger_reward_test", rewardTestData)
    if (result) {
      setRewardTestData({ user_id: "", feature: "", xp: 0 })
      loadDashboardData() // Refresh usage data
    }
  }

  const handleVoiceQuery = async () => {
    if (!voiceQuery.trim()) return

    const result = await executeFunction("voice_ai_query", { query: voiceQuery })
    if (result) {
      setAiResponse(result.reply_text)
      setVoiceQuery("")
    }
  }

  const getMoodColor = (mood: string) => {
    const colors = {
      joy: "text-yellow-600",
      gratitude: "text-green-600",
      excitement: "text-orange-600",
      love: "text-pink-600",
      neutral: "text-gray-600",
    }
    return colors[mood] || colors.neutral
  }

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      joy: "😊",
      gratitude: "🙏",
      excitement: "🎉",
      love: "❤️",
      neutral: "😐",
    }
    return emojis[mood] || emojis.neutral
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      {/* Admin Mode Watermark */}
      <div className="fixed top-4 right-4 z-50">
        <Badge variant="destructive" className="animate-pulse">
          <Shield className="w-4 h-4 mr-1" />
          ADMIN MODE ACTIVE
        </Badge>
      </div>

      {/* Audio element for TTS */}
      <audio ref={audioRef} className="hidden" />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Giftverse Leader Bot
            </h1>
            <p className="text-muted-foreground">
              Admin Control Panel for monitoring gifting intelligence, XP economy, and voice assistants
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              <Label>Voice Mode</Label>
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-green-600" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Galen Active
            </Badge>
          </div>
        </div>

        {/* Voice Interaction Status */}
        {(currentTranscript || galenResponse || isProcessing) && (
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>Giftverse Intelligence</span>
                {isProcessing && (
                  <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTranscript && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Voice Command:</Label>
                  <p className="text-sm bg-white p-3 rounded-md border">{currentTranscript}</p>
                </div>
              )}
              {galenResponse && (
                <div>
                  <Label className="text-sm font-medium text-indigo-600">Strategic Response:</Label>
                  <p className="text-sm bg-indigo-100 p-3 rounded-md border border-indigo-200">{galenResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🧠 AI Control Center */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>🧠 AI Control Center</span>
              </CardTitle>
              <CardDescription>Adjust assistant logic and AI behaviors across all internal bots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bot-name">Bot Name</Label>
                  <Input
                    id="bot-name"
                    value={botControlData.bot_name}
                    onChange={(e) => setBotControlData((prev) => ({ ...prev, bot_name: e.target.value }))}
                    placeholder="e.g., Agent Galen, Agent Avelyn"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleUpdateAssistantBrain} disabled={isProcessing} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Assistant Brain
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="logic-update">Logic Update</Label>
                <Textarea
                  id="logic-update"
                  value={botControlData.new_logic}
                  onChange={(e) => setBotControlData((prev) => ({ ...prev, new_logic: e.target.value }))}
                  placeholder="Enter new AI logic, personality adjustments, or behavioral modifications..."
                  rows={4}
                />
              </div>
              {adminUser?.role !== "founder" && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Voice assistant logic updates are restricted to founder access only.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 📈 Usage & XP Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>📈 Usage & XP Logs</span>
              </CardTitle>
              <CardDescription>Review XP, credit usage, and top-performing features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{usageSummary.total_features}</div>
                      <div className="text-sm text-blue-700">Total Features Used</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{usageSummary.xp_total.toLocaleString()}</div>
                      <div className="text-sm text-green-700">XP Distributed</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Top 3 Features</Label>
                    <div className="space-y-2 mt-2">
                      {usageSummary.top_features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{feature.name}</span>
                          <Badge variant="outline">{feature.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading usage data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🛠️ Feature Trigger + XP Reward */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span>🛠️ Feature Trigger + XP Reward</span>
              </CardTitle>
              <CardDescription>Simulate a user feature event to test rewards logic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-user-id">User ID</Label>
                <Input
                  id="test-user-id"
                  value={rewardTestData.user_id}
                  onChange={(e) => setRewardTestData((prev) => ({ ...prev, user_id: e.target.value }))}
                  placeholder="Enter user UUID"
                />
              </div>
              <div>
                <Label htmlFor="test-feature">Feature Name</Label>
                <Input
                  id="test-feature"
                  value={rewardTestData.feature}
                  onChange={(e) => setRewardTestData((prev) => ({ ...prev, feature: e.target.value }))}
                  placeholder="e.g., bondcraft, gift-dna, social-proof"
                />
              </div>
              <div>
                <Label htmlFor="test-xp">XP Amount</Label>
                <Input
                  id="test-xp"
                  type="number"
                  value={rewardTestData.xp}
                  onChange={(e) => setRewardTestData((prev) => ({ ...prev, xp: Number.parseInt(e.target.value) || 0 }))}
                  placeholder="XP to award"
                />
              </div>
              <Button onClick={handleRewardTest} disabled={isProcessing} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Trigger Reward Test
              </Button>
            </CardContent>
          </Card>

          {/* 🎤 Speak to Giftverse AI */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>🎤 Speak to Giftverse AI</span>
              </CardTitle>
              <CardDescription>Ask a question or command directly to the AI voice (Galen or Avelyn).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={voiceQuery}
                  onChange={(e) => setVoiceQuery(e.target.value)}
                  placeholder="Type your question or command..."
                  onKeyPress={(e) => e.key === "Enter" && handleVoiceQuery()}
                  className="flex-1"
                />
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button onClick={handleVoiceQuery} disabled={!voiceQuery.trim() || isProcessing}>
                  Send
                </Button>
              </div>
              {aiResponse && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-sm font-medium text-green-700">AI Response:</Label>
                  <p className="text-sm mt-1">{aiResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 📊 Emotional Trends */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>📊 Emotional Trends</span>
              </CardTitle>
              <CardDescription>
                Live graph from Emotion Engine showing recent gifting moods & tone shifts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Top Mood:</span>
                  <Badge className={`${getMoodColor(topMood)} bg-opacity-10`}>
                    {getMoodEmoji(topMood)} {topMood}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={loadDashboardData}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {emotionalTrends.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emotionalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="joy" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="gratitude" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="excitement" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="love" stroke="#ec4899" strokeWidth={2} />
                      <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading emotional trend data...</p>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Joy</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Gratitude</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Excitement</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Love</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Neutral</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Alert className="border-red-200 bg-red-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            🛡️ <strong>ADMIN REMINDER:</strong> This dashboard is restricted to authenticated admins only. Add Supabase
            RLS policies to enforce role-based access (admin only), and restrict voice assistant logic updates to your
            UID.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

