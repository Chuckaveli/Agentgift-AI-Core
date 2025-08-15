"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect, useRef } from "react"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Command,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  Activity,
  History,
  Trash2,
  Shield,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface Bot {
  id: string
  bot_name: string
  bot_display_name: string
  bot_description: string
  bot_icon: string
  bot_category: string
  current_status: "active" | "idle" | "error" | "maintenance"
  recent_metrics: any
  active_alerts: number
  recent_activity: number
  last_activity: string
}

interface CommandHistoryItem {
  id: string
  command_text: string
  bot_target: string
  action_taken: string
  command_result: string
  voice_input: boolean
  created_at: string
}

// Default bots data as fallback
const DEFAULT_BOTS: Bot[] = [
  {
    id: "1",
    bot_name: "ag-tokenomics-v3",
    bot_display_name: "AG Tokenomics v3 Bot",
    bot_description: "Manages XP, badges, and token economy systems",
    bot_icon: "🧮",
    bot_category: "economy",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "2",
    bot_name: "emotional-signature-engine",
    bot_display_name: "Emotional Signature Engine Bot",
    bot_description: "Analyzes and processes emotional intelligence data",
    bot_icon: "🧠",
    bot_category: "intelligence",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "3",
    bot_name: "gift-intel-blog-generator",
    bot_display_name: "Gift Intel Blog Generator Bot",
    bot_description: "Creates content and blog posts about gifting trends",
    bot_icon: "📢",
    bot_category: "content",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "4",
    bot_name: "social-media-manager",
    bot_display_name: "Social Media Manager Bot",
    bot_description: "Handles social media posting and engagement",
    bot_icon: "📅",
    bot_category: "marketing",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "5",
    bot_name: "giftverse-game-engine",
    bot_display_name: "Giftverse Game Engine Bot",
    bot_description: "Powers gamification and interactive experiences",
    bot_icon: "🎁",
    bot_category: "gaming",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "6",
    bot_name: "silent-intent-detection",
    bot_display_name: "Silent Intent Detection Bot",
    bot_description: "Analyzes user behavior and predicts intentions",
    bot_icon: "🕵️‍♂️",
    bot_category: "intelligence",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "7",
    bot_name: "voice-assistant-engine",
    bot_display_name: "Voice Assistant Engine Bot",
    bot_description: "Manages voice interactions and TTS/STT processing",
    bot_icon: "💬",
    bot_category: "interface",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
  {
    id: "8",
    bot_name: "referral-system",
    bot_display_name: "Referral System Bot",
    bot_description: "Handles user referrals and reward distribution",
    bot_icon: "👥",
    bot_category: "growth",
    current_status: "idle",
    recent_metrics: null,
    active_alerts: 0,
    recent_activity: 0,
    last_activity: new Date().toISOString(),
  },
]

export default function CommandDeckPage() {
  const { profile, loading, error, isAdmin } = useUser()
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>(DEFAULT_BOTS)
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([])
  const [failureAlerts, setFailureAlerts] = useState<any[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [textInput, setTextInput] = useState("")
  const [sessionId] = useState(`command_deck_${Date.now()}`)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [dataLoaded, setDataLoaded] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle authentication and admin check
  useEffect(() => {
    if (!loading) {
      if (error) {
        toast.error("Authentication error: " + error)
        router.push("/login")
        return
      }

      if (!profile) {
        toast.error("Please log in to access the Command Deck")
        router.push("/login")
        return
      }

      if (!isAdmin) {
        toast.error("Restricted zone. Only Giftverse Admins may summon the AI Council.")
        router.push("/dashboard")
        return
      }
    }
  }, [profile, loading, error, isAdmin, router])

  // Load initial data and set up refresh interval
  useEffect(() => {
    if (isAdmin && profile?.id) {
      loadDashboardData()
      const interval = setInterval(loadDashboardData, 15000) // Refresh every 15 seconds
      return () => clearInterval(interval)
    }
  }, [isAdmin, profile?.id])

  const loadDashboardData = async () => {
    if (!profile?.id) return

    try {
      setApiError(null)

      // Try to load bots status
      try {
        const botsResponse = await fetch(`/api/admin/command-deck/bots?adminId=${profile.id}`)
        if (botsResponse.ok) {
          const botsData = await botsResponse.json()
          if (botsData.success && botsData.bots) {
            setBots(botsData.bots)
          }
        } else {
          console.warn("Bots API not available, using default data")
        }
      } catch (err) {
        console.warn("Bots API error:", err)
        // Keep using default bots data
      }

      // Try to load command history
      try {
        const historyResponse = await fetch(`/api/admin/command-deck/history?adminId=${profile.id}&limit=5`)
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          if (historyData.success) {
            setCommandHistory(historyData.history || [])
            setFailureAlerts(historyData.failureAlerts || [])
          }
        }
      } catch (err) {
        console.warn("History API error:", err)
        // Keep empty history
      }

      setLastRefresh(Date.now())
      setDataLoaded(true)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setApiError("Some features may be limited due to API connectivity issues")
      setDataLoaded(true)
    }
  }

  const executeBotAction = async (action: string, botName: string, commandInput?: string) => {
    setIsProcessing(true)
    try {
      // Simulate bot action for demo purposes
      const responses = {
        summon: `Summoning ${getBotDisplayName(botName)} now… Bot activation systems engaged. Ready to process commands.`,
        pause: `Pausing ${getBotDisplayName(botName)}… All active processes suspended. Bot will remain in standby mode.`,
        reset: `Resetting ${getBotDisplayName(botName)}… All cached data cleared, connections refreshed. Bot is ready for new commands.`,
        status_check: `${getBotDisplayName(botName)} Status Report: System operational, ready for commands. All subsystems functioning normally.`,
      }

      const response =
        responses[action as keyof typeof responses] || `${action} executed on ${getBotDisplayName(botName)}`

      // Update bot status locally
      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.bot_name === botName
            ? {
                ...bot,
                current_status: action === "summon" ? "active" : action === "pause" ? "idle" : bot.current_status,
                recent_activity: bot.recent_activity + 1,
                last_activity: new Date().toISOString(),
              }
            : bot,
        ),
      )

      // Add to command history
      const newHistoryItem: CommandHistoryItem = {
        id: Date.now().toString(),
        command_text: `${action} ${botName}`,
        bot_target: botName,
        action_taken: action,
        command_result: response,
        voice_input: false,
        created_at: new Date().toISOString(),
      }

      setCommandHistory((prev) => [newHistoryItem, ...prev.slice(0, 4)])

      toast.success(`${action} executed successfully on ${getBotDisplayName(botName)}`)

      // Speak the response
      await speakMessage(response)
    } catch (error) {
      console.error("Bot action error:", error)
      toast.error(`Failed to execute ${action}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const startListening = async () => {
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
        // For demo purposes, simulate voice recognition
        setTimeout(() => {
          const demoCommands = [
            "Summon Tokenomics Bot",
            "Status report for all bots",
            "Activate Emotional Engine Bot",
            "Pause Social Media Manager",
          ]
          const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)]
          setTranscript(randomCommand)
          processTextCommand(randomCommand)
        }, 1000)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
      toast.success("Listening for command...")
    } catch (error) {
      console.error("Failed to start listening:", error)
      toast.error("Failed to access microphone")
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const processTextCommand = (command: string) => {
    setIsProcessing(true)

    const lowerCommand = command.toLowerCase()
    let response = ""
    let botTarget = ""
    let action = ""

    // Parse command
    if (lowerCommand.includes("summon") || lowerCommand.includes("activate")) {
      const botName = extractBotName(lowerCommand)
      if (botName) {
        botTarget = botName
        action = "summon"
        response = `Summoning the ${getBotDisplayName(botName)} now… Bot activation systems engaged. Ready to process commands.`

        // Update bot status
        setBots((prevBots) =>
          prevBots.map((bot) =>
            bot.bot_name === botName
              ? { ...bot, current_status: "active", recent_activity: bot.recent_activity + 1 }
              : bot,
          ),
        )
      }
    } else if (lowerCommand.includes("status")) {
      const botName = extractBotName(lowerCommand)
      if (botName) {
        botTarget = botName
        action = "status_check"
        response = `${getBotDisplayName(botName)} Status Report: System operational, ready for commands. All subsystems functioning normally.`
      } else {
        botTarget = "all"
        action = "general_status"
        response =
          "Accessing Command Deck status… All AI Council members are monitored. Systems are operational and ready for commands."
      }
    } else if (lowerCommand.includes("pause") || lowerCommand.includes("stop")) {
      const botName = extractBotName(lowerCommand)
      if (botName) {
        botTarget = botName
        action = "pause"
        response = `Pausing ${getBotDisplayName(botName)}… All active processes suspended.`

        // Update bot status
        setBots((prevBots) =>
          prevBots.map((bot) => (bot.bot_name === botName ? { ...bot, current_status: "idle" } : bot)),
        )
      }
    } else {
      response =
        "Hmm, I didn't quite catch that. Which bot would you like to summon or control? Available bots include Tokenomics, Emotional Engine, Gift Intel, Social Media Manager, Game Engine, Intent Detection, Voice Assistant, and Referral System."
      action = "clarification_needed"
    }

    // Add to command history
    const newHistoryItem: CommandHistoryItem = {
      id: Date.now().toString(),
      command_text: command,
      bot_target: botTarget,
      action_taken: action,
      command_result: response,
      voice_input: true,
      created_at: new Date().toISOString(),
    }

    setCommandHistory((prev) => [newHistoryItem, ...prev.slice(0, 4)])
    setAiResponse(response)

    setTimeout(() => {
      speakMessage(response)
      setIsProcessing(false)
    }, 500)
  }

  const speakMessage = async (message: string) => {
    setIsSpeaking(true)

    try {
      // Use Web Speech API if available
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(message)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8

        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        speechSynthesis.speak(utterance)
      } else {
        // Fallback: just show the message
        setTimeout(() => setIsSpeaking(false), 2000)
      }
    } catch (error) {
      console.error("Text-to-speech error:", error)
      setIsSpeaking(false)
      toast.error("Failed to generate speech")
    }
  }

  const handleTextCommand = () => {
    if (textInput.trim()) {
      setTranscript(textInput)
      processTextCommand(textInput)
      setTextInput("")
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const clearCommandHistory = async () => {
    setCommandHistory([])
    toast.success("Command history cleared")
  }

  const extractBotName = (command: string): string => {
    const botMappings = {
      tokenomics: "ag-tokenomics-v3",
      "emotional engine": "emotional-signature-engine",
      emotional: "emotional-signature-engine",
      "gift intel": "gift-intel-blog-generator",
      "blog generator": "gift-intel-blog-generator",
      "social media": "social-media-manager",
      social: "social-media-manager",
      "game engine": "giftverse-game-engine",
      gaming: "giftverse-game-engine",
      "intent detection": "silent-intent-detection",
      intent: "silent-intent-detection",
      "voice assistant": "voice-assistant-engine",
      voice: "voice-assistant-engine",
      referral: "referral-system",
    }

    for (const [key, value] of Object.entries(botMappings)) {
      if (command.includes(key)) {
        return value
      }
    }

    return ""
  }

  const getBotDisplayName = (botName: string): string => {
    const bot = bots.find((b) => b.bot_name === botName)
    return bot?.bot_display_name || botName
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "idle":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "maintenance":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      idle: "secondary",
      error: "destructive",
      maintenance: "outline",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="capitalize">
        {status}
      </Badge>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
          <p className="text-purple-200">Initializing Command Deck...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200 mb-4">{error}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200 mb-4">Restricted zone. Only Giftverse Admins may summon the AI Council.</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Command className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Command Deck AI
              </h1>
              <p className="text-gray-300">Internal AI Bot Management • Welcome, {profile?.name || "Admin"}</p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Activity className="h-3 w-3 mr-1" />
              {bots.filter((bot) => bot.current_status === "active").length} Active
            </Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              <Clock className="h-3 w-3 mr-1" />
              {bots.filter((bot) => bot.current_status === "idle").length} Idle
            </Badge>
            <Badge variant="outline" className="border-red-500 text-red-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {bots.filter((bot) => bot.current_status === "error").length} Errors
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Brain className="h-3 w-3 mr-1" />
              Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <Alert className="border-yellow-500 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-yellow-200">Limited Functionality</AlertTitle>
            <AlertDescription className="text-yellow-100">{apiError}</AlertDescription>
          </Alert>
        )}

        {/* Failure Alerts */}
        {failureAlerts.length > 0 && (
          <Alert className="border-red-500 bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-200">Bot Failure Alerts</AlertTitle>
            <AlertDescription className="text-red-100">
              {failureAlerts.map((alert, index) => (
                <div key={index}>
                  ⚠️ {alert.bot_name} has experienced {alert.failure_count} failures in the last 24 hours.
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Interface */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Command Interface
              </CardTitle>
              <CardDescription className="text-purple-200">Speak to summon and control AI bots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || isSpeaking}
                  className={`${
                    isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Listen
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  onClick={isSpeaking ? stopSpeaking : () => speakMessage(aiResponse)}
                  disabled={!aiResponse || isProcessing}
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-600/20"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Speak
                    </>
                  )}
                </Button>
              </div>

              {/* Processing Indicator */}
              {(isProcessing || isListening || isSpeaking) && (
                <div className="text-center space-y-2">
                  <Progress value={isProcessing ? 50 : isListening ? 25 : 75} className="w-full" />
                  <p className="text-purple-300 text-sm">
                    {isListening && "🎤 Listening for command..."}
                    {isProcessing && "🧠 Processing command..."}
                    {isSpeaking && "🔊 Speaking response..."}
                  </p>
                </div>
              )}

              {/* Text Input Alternative */}
              <Separator className="bg-purple-500/20" />
              <div className="space-y-2">
                <Label className="text-purple-200">Or type command:</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="e.g., 'Summon Tokenomics Bot'"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleTextCommand()
                      }
                    }}
                  />
                  <Button
                    onClick={handleTextCommand}
                    disabled={!textInput.trim() || isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Recent Interaction */}
              {(transcript || aiResponse) && (
                <div className="space-y-3 pt-4 border-t border-purple-500/20">
                  {transcript && (
                    <div className="space-y-1">
                      <Label className="text-blue-300 text-xs">Your Command:</Label>
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

          {/* Bot Status Grid */}
          <Card className="lg:col-span-2 bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">AI Bot Council</CardTitle>
              <CardDescription className="text-purple-200">Manage and monitor all internal AI systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bots.map((bot) => (
                  <div key={bot.id} className="border border-purple-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{bot.bot_icon}</span>
                        <div>
                          <h3 className="font-medium text-white text-sm">{bot.bot_display_name}</h3>
                          <p className="text-xs text-gray-400 capitalize">{bot.bot_category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bot.current_status)}
                        {getStatusBadge(bot.current_status)}
                      </div>
                    </div>

                    <p className="text-xs text-gray-300">{bot.bot_description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Activity: {bot.recent_activity}</span>
                      {bot.active_alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {bot.active_alerts} alerts
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => executeBotAction("summon", bot.bot_name)}
                        disabled={isProcessing || bot.current_status === "active"}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Summon
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => executeBotAction("pause", bot.bot_name)}
                        disabled={isProcessing || bot.current_status !== "active"}
                        variant="outline"
                        className="border-yellow-500 text-yellow-300 hover:bg-yellow-600/20 text-xs px-2 py-1 h-7"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => executeBotAction("reset", bot.bot_name)}
                        disabled={isProcessing}
                        variant="outline"
                        className="border-blue-500 text-blue-300 hover:bg-blue-600/20 text-xs px-2 py-1 h-7"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => executeBotAction("status_check", bot.bot_name)}
                        disabled={isProcessing}
                        variant="outline"
                        className="border-purple-500 text-purple-300 hover:bg-purple-600/20 text-xs px-2 py-1 h-7"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Logs
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Command History */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Command History
                </CardTitle>
                <CardDescription className="text-purple-200">Latest bot commands and responses</CardDescription>
              </div>
              <Button
                onClick={clearCommandHistory}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-300 hover:bg-red-600/20 bg-transparent"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {commandHistory.length > 0 ? (
                  commandHistory.map((item) => (
                    <div key={item.id} className="border border-purple-500/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.voice_input ? (
                            <Mic className="h-3 w-3 text-green-400" />
                          ) : (
                            <Command className="h-3 w-3 text-blue-400" />
                          )}
                          <span className="text-sm text-white">{item.command_text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.bot_target && (
                            <Badge variant="outline" className="text-xs">
                              {item.bot_target}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {item.command_result && (
                        <p className="text-xs text-gray-300 bg-gray-800/30 p-2 rounded">{item.command_result}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-purple-400">
                    <Command className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No commands executed yet</p>
                    <p className="text-sm mt-2">Try saying "Summon Tokenomics Bot" or "Status report"</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 italic border-t border-purple-500/30 pt-4">
          "Command the AI Council. Shape the Giftverse. Every bot serves the greater intelligence."
        </div>
      </div>
    </div>
  )
}

