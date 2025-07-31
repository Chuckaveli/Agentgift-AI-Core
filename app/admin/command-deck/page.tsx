"use client"

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

export default function CommandDeckPage() {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!profile || !profile.admin_role)) {
      router.push("/dashboard")
      toast.error("Restricted zone. Only Giftverse Admins may summon the AI Council.")
    }
  }, [profile, loading, router])

  // Load initial data and set up refresh interval
  useEffect(() => {
    if (profile?.admin_role) {
      loadDashboardData()
      const interval = setInterval(loadDashboardData, 15000) // Refresh every 15 seconds
      return () => clearInterval(interval)
    }
  }, [profile])

  const loadDashboardData = async () => {
    try {
      // Load bots status
      const botsResponse = await fetch(`/api/admin/command-deck/bots?adminId=${profile?.id}`)
      const botsData = await botsResponse.json()
      if (botsData.success) {
        setBots(botsData.bots)
      }

      // Load command history
      const historyResponse = await fetch(`/api/admin/command-deck/history?adminId=${profile?.id}&limit=5`)
      const historyData = await historyResponse.json()
      if (historyData.success) {
        setCommandHistory(historyData.history)
        setFailureAlerts(historyData.failureAlerts)
      }

      setLastRefresh(Date.now())
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    }
  }

  const executeBotAction = async (action: string, botName: string, commandInput?: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/command-deck/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          botName,
          adminId: profile?.id,
          sessionId,
          commandInput,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${action} executed successfully on ${data.botName}`)
        // Speak the response
        await speakMessage(data.response)
        // Refresh data
        loadDashboardData()
      } else {
        toast.error(data.error || `Failed to ${action} bot`)
      }
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
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result?.toString().split(",")[1]
          if (base64Audio) {
            processVoiceCommand("speech_to_text", base64Audio)
          }
        }
        reader.readAsDataURL(audioBlob)
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

  const processVoiceCommand = async (action: string, audioData?: string, textCommand?: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/admin/command-deck/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          audioData,
          textInput: textCommand,
          sessionId,
          adminId: profile?.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.transcript) {
          setTranscript(data.transcript)
        }
        if (data.aiResponse) {
          setAiResponse(data.aiResponse)
          await speakMessage(data.aiResponse)
        }

        // Refresh data after command
        loadDashboardData()
        toast.success("Command processed successfully")
      } else {
        toast.error(data.error || "Failed to process command")
        if (data.voiceMessage) {
          await speakMessage(data.voiceMessage)
        }
      }
    } catch (error) {
      console.error("Voice command error:", error)
      toast.error("Failed to process voice command")
    } finally {
      setIsProcessing(false)
    }
  }

  const speakMessage = async (message: string) => {
    setIsSpeaking(true)

    try {
      const response = await fetch("/api/admin/command-deck/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "text_to_speech",
          textInput: message,
          sessionId,
          adminId: profile?.id,
        }),
      })

      const data = await response.json()

      if (data.success && data.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioData}`)
        audioRef.current = audio

        audio.onended = () => setIsSpeaking(false)
        audio.onerror = () => {
          setIsSpeaking(false)
          toast.error("Failed to play audio response")
        }

        await audio.play()
      }
    } catch (error) {
      console.error("Text-to-speech error:", error)
      setIsSpeaking(false)
      toast.error("Failed to generate speech")
    }
  }

  const handleTextCommand = () => {
    if (textInput.trim()) {
      processVoiceCommand("process_command", undefined, textInput)
      setTextInput("")
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
    }
  }

  const clearCommandHistory = async () => {
    try {
      const response = await fetch(`/api/admin/command-deck/history?adminId=${profile?.id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setCommandHistory([])
        toast.success("Command history cleared")
      }
    } catch (error) {
      console.error("Failed to clear history:", error)
      toast.error("Failed to clear command history")
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Initializing Command Deck...</p>
        </div>
      </div>
    )
  }

  if (!profile?.admin_role) {
    return null // Will redirect
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
              <p className="text-gray-300">Internal AI Bot Management • Welcome, {profile.name}</p>
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
                          <p className="text-xs text-gray-400">{bot.bot_category}</p>
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
                <CardDescription className="text-purple-200">Latest 5 bot commands and responses</CardDescription>
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
