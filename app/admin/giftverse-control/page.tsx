"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  Zap,
  Award,
  Activity,
  Brain,
  Heart,
  Eye,
  Download,
  MessageSquare,
  Filter,
  Plus,
  Minus,
  Crown,
  Ghost,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface VoiceSettings {
  voice_enabled: boolean
  selected_voice: string
  voice_speed: number
  auto_speak_results: boolean
}

interface EmotionalLog {
  id: string
  user_id: string
  emotion_tags: string[]
  intensity_score: number
  feature_context: string
  created_at: string
  user_profiles?: {
    name: string
    email: string
  }
}

interface FeatureUsageLog {
  id: string
  user_id: string
  feature_name: string
  usage_duration: number
  success_rate: number
  created_at: string
  user_profiles?: {
    name: string
    email: string
    tier: string
  }
}

export default function GiftverseControlDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice_enabled: true,
    selected_voice: "galen",
    voice_speed: 0.9,
    auto_speak_results: true,
  })
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [galenResponse, setGalenResponse] = useState("")
  const [sessionId] = useState(() => `admin-${Date.now()}`)

  // Dashboard data states
  const [emotionalLogs, setEmotionalLogs] = useState<EmotionalLog[]>([])
  const [featureUsageLogs, setFeatureUsageLogs] = useState<FeatureUsageLog[]>([])
  const [giftverseHealth, setGiftverseHealth] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [impersonationActive, setImpersonationActive] = useState(false)
  const [ghostModeActive, setGhostModeActive] = useState(false)

  // Form states
  const [xpAdjustment, setXpAdjustment] = useState({ userId: "", amount: 0, reason: "" })
  const [creditAdjustment, setCreditAdjustment] = useState({ userId: "", amount: 0, reason: "" })
  const [badgeAssignment, setBadgeAssignment] = useState({ userId: "", badgeId: "", reason: "" })
  const [announcementData, setAnnouncementData] = useState({ message: "", audience: "all", priority: "medium" })

  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Initialize admin session
    initializeAdminSession()
    loadDashboardData()

    // Galen's greeting
    if (voiceSettings.voice_enabled) {
      setTimeout(() => {
        speakText(
          "Greetings, Agent. I am Galen, guardian of the Giftverse's heartbeat. The platform pulses with life - how may I serve your administrative vision today?",
        )
      }, 1000)
    }
  }, [])

  const initializeAdminSession = async () => {
    // Mock admin user - in real app, get from auth
    setAdminUser({
      id: "admin-001",
      name: "Sarah Chen",
      email: "sarah@agentgift.ai",
      role: "founder",
      avatar: "/placeholder.svg?height=40&width=40",
    })
  }

  const loadDashboardData = async () => {
    try {
      // Load emotional logs
      const emotionalResponse = await fetch("/api/admin/giftverse-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_emotional_logs",
          parameters: { filters: {}, limit: 50 },
          session_id: sessionId,
        }),
      })
      const emotionalData = await emotionalResponse.json()
      if (emotionalData.success) {
        setEmotionalLogs(emotionalData.result)
      }

      // Load feature usage logs
      const featureResponse = await fetch("/api/admin/giftverse-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_feature_usage_logs",
          parameters: { filters: {}, limit: 50 },
          session_id: sessionId,
        }),
      })
      const featureData = await featureResponse.json()
      if (featureData.success) {
        setFeatureUsageLogs(featureData.result)
      }

      // Load Giftverse health
      const healthResponse = await fetch("/api/admin/giftverse-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export_giftverse_health",
          parameters: {},
          session_id: sessionId,
        }),
      })
      const healthData = await healthResponse.json()
      if (healthData.success) {
        setGiftverseHealth(healthData.result)
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
            processVoiceCommand(base64Audio)
          }
        }
        reader.readAsDataURL(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)

      // Auto-stop after 10 seconds
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

  const processVoiceCommand = async (audioData: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/giftverse-control/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "speech_to_text",
          audioData,
          sessionId,
          adminId: adminUser?.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCurrentTranscript(data.transcript)
        setGalenResponse(data.galen_response)

        if (voiceSettings.auto_speak_results && data.galen_response) {
          speakText(data.galen_response)
        }

        // Refresh dashboard data if needed
        if (data.action_taken?.includes("adjustment") || data.action_taken?.includes("assignment")) {
          loadDashboardData()
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
      const response = await fetch("/api/admin/giftverse-control/voice", {
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

  const executeAdminAction = async (action: string, parameters: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/giftverse-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          parameters,
          session_id: sessionId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Action Completed",
          description: `Successfully executed: ${action}`,
        })

        if (voiceSettings.auto_speak_results) {
          speakText(`Action completed successfully, Agent. ${action} has been executed.`)
        }

        // Refresh data
        loadDashboardData()
        return data.result
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Admin action error:", error)
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleXPAdjustment = async () => {
    if (!xpAdjustment.userId || !xpAdjustment.reason) {
      toast({
        title: "Missing Information",
        description: "Please provide user ID and reason for XP adjustment.",
        variant: "destructive",
      })
      return
    }

    await executeAdminAction("adjust_user_xp", {
      user_id: xpAdjustment.userId,
      xp_change: xpAdjustment.amount,
      reason: xpAdjustment.reason,
    })

    setXpAdjustment({ userId: "", amount: 0, reason: "" })
  }

  const handleCreditAdjustment = async () => {
    if (!creditAdjustment.userId || !creditAdjustment.reason) {
      toast({
        title: "Missing Information",
        description: "Please provide user ID and reason for credit adjustment.",
        variant: "destructive",
      })
      return
    }

    await executeAdminAction("adjust_user_credits", {
      user_id: creditAdjustment.userId,
      credit_change: creditAdjustment.amount,
      reason: creditAdjustment.reason,
    })

    setCreditAdjustment({ userId: "", amount: 0, reason: "" })
  }

  const handleBadgeAssignment = async () => {
    if (!badgeAssignment.userId || !badgeAssignment.badgeId || !badgeAssignment.reason) {
      toast({
        title: "Missing Information",
        description: "Please provide user ID, badge ID, and reason.",
        variant: "destructive",
      })
      return
    }

    await executeAdminAction("assign_badge", {
      user_id: badgeAssignment.userId,
      badge_id: badgeAssignment.badgeId,
      reason: badgeAssignment.reason,
    })

    setBadgeAssignment({ userId: "", badgeId: "", reason: "" })
  }

  const handle5XPBonus = async (userId: string) => {
    await executeAdminAction("grant_5xp_bonus", {
      user_id: userId,
      reason: "Manual admin bonus for participation",
    })
  }

  const toggleGhostMode = async () => {
    if (!selectedUser) {
      toast({
        title: "No User Selected",
        description: "Please select a user to impersonate first.",
        variant: "destructive",
      })
      return
    }

    if (!ghostModeActive) {
      await executeAdminAction("start_impersonation", {
        user_id: selectedUser,
        reason: "Admin testing and observation",
      })
      setGhostModeActive(true)
      setImpersonationActive(true)
    } else {
      // End impersonation logic would go here
      setGhostModeActive(false)
      setImpersonationActive(false)
    }
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: "bg-yellow-100 text-yellow-800",
      gratitude: "bg-green-100 text-green-800",
      excitement: "bg-orange-100 text-orange-800",
      love: "bg-pink-100 text-pink-800",
      surprise: "bg-purple-100 text-purple-800",
      neutral: "bg-gray-100 text-gray-800",
    }
    return colors[emotion] || colors.neutral
  }

  const getTierColor = (tier: string) => {
    const colors = {
      free_agent: "bg-gray-100 text-gray-800",
      premium_spy: "bg-blue-100 text-blue-800",
      pro_agent: "bg-purple-100 text-purple-800",
      agent_00g: "bg-gold-100 text-gold-800",
    }
    return colors[tier] || colors.free_agent
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Giftverse Control Center
            </h1>
            <p className="text-muted-foreground">Secure internal dashboard for platform administration</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Voice Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? "Stop" : "Speak"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceSettings((prev) => ({ ...prev, voice_enabled: !prev.voice_enabled }))}
              >
                {voiceSettings.voice_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={adminUser?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {adminUser?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{adminUser?.name}</p>
                <p className="text-xs text-muted-foreground">{adminUser?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Interaction Panel */}
        {(currentTranscript || galenResponse || isProcessing) && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>Agent Galen</span>
                {isProcessing && (
                  <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTranscript && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Your Command:</Label>
                  <p className="text-sm bg-white p-3 rounded-md border">{currentTranscript}</p>
                </div>
              )}
              {galenResponse && (
                <div>
                  <Label className="text-sm font-medium text-purple-600">Galen's Response:</Label>
                  <p className="text-sm bg-purple-100 p-3 rounded-md border border-purple-200">{galenResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="economy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="economy">XP & Credits</TabsTrigger>
            <TabsTrigger value="emotional">Emotional Intel</TabsTrigger>
            <TabsTrigger value="features">Feature Usage</TabsTrigger>
            <TabsTrigger value="users">User Control</TabsTrigger>
            <TabsTrigger value="voice">Voice Control</TabsTrigger>
            <TabsTrigger value="health">Health Monitor</TabsTrigger>
          </TabsList>

          {/* XP & Credit Economy Control */}
          <TabsContent value="economy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* XP Adjustment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>XP Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="xp-user">User ID</Label>
                    <Input
                      id="xp-user"
                      value={xpAdjustment.userId}
                      onChange={(e) => setXpAdjustment((prev) => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="xp-amount">XP Change</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setXpAdjustment((prev) => ({ ...prev, amount: prev.amount - 10 }))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="xp-amount"
                        type="number"
                        value={xpAdjustment.amount}
                        onChange={(e) =>
                          setXpAdjustment((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) || 0 }))
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setXpAdjustment((prev) => ({ ...prev, amount: prev.amount + 10 }))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="xp-reason">Reason</Label>
                    <Textarea
                      id="xp-reason"
                      value={xpAdjustment.reason}
                      onChange={(e) => setXpAdjustment((prev) => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for adjustment"
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleXPAdjustment} className="w-full" disabled={isProcessing}>
                    <Zap className="w-4 h-4 mr-2" />
                    Adjust XP
                  </Button>
                </CardContent>
              </Card>

              {/* Credit Adjustment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span>Credit Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="credit-user">User ID</Label>
                    <Input
                      id="credit-user"
                      value={creditAdjustment.userId}
                      onChange={(e) => setCreditAdjustment((prev) => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit-amount">Credit Change</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreditAdjustment((prev) => ({ ...prev, amount: prev.amount - 5 }))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="credit-amount"
                        type="number"
                        value={creditAdjustment.amount}
                        onChange={(e) =>
                          setCreditAdjustment((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) || 0 }))
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreditAdjustment((prev) => ({ ...prev, amount: prev.amount + 5 }))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="credit-reason">Reason</Label>
                    <Textarea
                      id="credit-reason"
                      value={creditAdjustment.reason}
                      onChange={(e) => setCreditAdjustment((prev) => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for adjustment"
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleCreditAdjustment} className="w-full" disabled={isProcessing}>
                    <Crown className="w-4 h-4 mr-2" />
                    Adjust Credits
                  </Button>
                </CardContent>
              </Card>

              {/* Badge Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span>Badge Assignment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="badge-user">User ID</Label>
                    <Input
                      id="badge-user"
                      value={badgeAssignment.userId}
                      onChange={(e) => setBadgeAssignment((prev) => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-id">Badge ID</Label>
                    <Select
                      value={badgeAssignment.badgeId}
                      onValueChange={(value) => setBadgeAssignment((prev) => ({ ...prev, badgeId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rising_star">Rising Star</SelectItem>
                        <SelectItem value="cultural_ambassador">Cultural Ambassador</SelectItem>
                        <SelectItem value="bondcraft_master">BondCraft Master</SelectItem>
                        <SelectItem value="great_samaritan">Great Samaritan</SelectItem>
                        <SelectItem value="emotion_whisperer">Emotion Whisperer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="badge-reason">Reason</Label>
                    <Textarea
                      id="badge-reason"
                      value={badgeAssignment.reason}
                      onChange={(e) => setBadgeAssignment((prev) => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for badge assignment"
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleBadgeAssignment} className="w-full" disabled={isProcessing}>
                    <Award className="w-4 h-4 mr-2" />
                    Assign Badge
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Rapid reward and management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handle5XPBonus(selectedUser)}
                    disabled={!selectedUser || isProcessing}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    5XP Bonus
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleGhostMode}
                    disabled={!selectedUser || isProcessing}
                  >
                    <Ghost className="w-4 h-4 mr-2" />
                    {ghostModeActive ? "Exit Ghost Mode" : "Ghost Mode"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeAdminAction("export_giftverse_health", {})}
                    disabled={isProcessing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Health
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emotional Intelligence Logs */}
          <TabsContent value="emotional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Emotional Intelligence Logs</span>
                </CardTitle>
                <CardDescription>Monitor emotional tagging, gift reactions, and mood patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Input placeholder="Search emotions..." />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  {/* Emotional Logs Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Emotions</TableHead>
                          <TableHead>Intensity</TableHead>
                          <TableHead>Context</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emotionalLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{log.user_profiles?.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{log.user_profiles?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {log.emotion_tags.map((emotion, index) => (
                                  <Badge key={index} className={getEmotionColor(emotion)}>
                                    {emotion}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={log.intensity_score * 100} className="w-16" />
                                <span className="text-sm">{(log.intensity_score * 100).toFixed(0)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.feature_context}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Usage Logs */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span>Feature Usage & Unlock Tracker</span>
                </CardTitle>
                <CardDescription>Monitor badge unlocks, assistant activations, and feature engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Feature Usage Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Feature</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Success Rate</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {featureUsageLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{log.user_profiles?.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{log.user_profiles?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.feature_name}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTierColor(log.user_profiles?.tier || "free_agent")}>
                                {log.user_profiles?.tier}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.usage_duration}s</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={log.success_rate} className="w-16" />
                                <span className="text-sm">{log.success_rate.toFixed(0)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handle5XPBonus(log.user_id)}>
                                <Sparkles className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Control Panel */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span>User Selection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <Input
                      id="user-select"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      placeholder="Enter user ID or email"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={impersonationActive}
                      onCheckedChange={setImpersonationActive}
                      disabled={!selectedUser}
                    />
                    <Label>Impersonate User (Safe Toggle)</Label>
                  </div>
                  {impersonationActive && (
                    <Alert>
                      <Eye className="h-4 w-4" />
                      <AlertDescription>Impersonation active for user: {selectedUser}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <span>Platform Announcements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="announcement-message">Message</Label>
                    <Textarea
                      id="announcement-message"
                      value={announcementData.message}
                      onChange={(e) => setAnnouncementData((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter announcement message"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="announcement-audience">Audience</Label>
                      <Select
                        value={announcementData.audience}
                        onValueChange={(value) => setAnnouncementData((prev) => ({ ...prev, audience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="free_agent">Free Agents</SelectItem>
                          <SelectItem value="premium_spy">Premium Spies</SelectItem>
                          <SelectItem value="pro_agent">Pro Agents</SelectItem>
                          <SelectItem value="agent_00g">Agent 00G</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcement-priority">Priority</Label>
                      <Select
                        value={announcementData.priority}
                        onValueChange={(value) => setAnnouncementData((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={() => executeAdminAction("trigger_announcement", announcementData)}
                    className="w-full"
                    disabled={!announcementData.message || isProcessing}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voice Concierge Control */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  <span>Voice Concierge Control</span>
                </CardTitle>
                <CardDescription>Manage AI voice personas and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Voice Assistant</Label>
                      <Select
                        value={voiceSettings.selected_voice}
                        onValueChange={(value) => setVoiceSettings((prev) => ({ ...prev, selected_voice: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="galen">Agent Galen (Calm, Poetic)</SelectItem>
                          <SelectItem value="avelyn">Agent Avelyn (Warm, Professional)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={voiceSettings.voice_enabled}
                        onCheckedChange={(checked) => setVoiceSettings((prev) => ({ ...prev, voice_enabled: checked }))}
                      />
                      <Label>Voice Responses Enabled</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={voiceSettings.auto_speak_results}
                        onCheckedChange={(checked) =>
                          setVoiceSettings((prev) => ({ ...prev, auto_speak_results: checked }))
                        }
                      />
                      <Label>Auto-Speak Results</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Voice Speed: {voiceSettings.voice_speed}x</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.voice_speed}
                        onChange={(e) =>
                          setVoiceSettings((prev) => ({ ...prev, voice_speed: Number.parseFloat(e.target.value) }))
                        }
                        className="w-full"
                      />
                    </div>

                    <Button
                      onClick={() => speakText("Voice test successful, Agent. I am functioning optimally.")}
                      variant="outline"
                      disabled={!voiceSettings.voice_enabled}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Test Voice
                    </Button>
                  </div>
                </div>

                {/* Galen's Status */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-indigo-900">Agent Galen Status: Active</p>
                      <p className="text-sm text-indigo-700">"I serve the Giftverse's heartbeat, one log at a time."</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Monitor */}
          <TabsContent value="health" className="space-y-6">
            {giftverseHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{giftverseHealth.total_users?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{giftverseHealth.active_users_24h} active today</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">XP Circulation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{giftverseHealth.total_xp_circulation?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total experience points</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Economy Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{giftverseHealth.economy_health_score?.toFixed(1)}%</div>
                    <Progress value={giftverseHealth.economy_health_score} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{giftverseHealth.engagement_rate?.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">24h active users</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Features */}
            {giftverseHealth?.top_features && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Features Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {giftverseHealth.top_features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{feature.feature_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(feature.usage_count / giftverseHealth.top_features[0].usage_count) * 100}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">{feature.usage_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

