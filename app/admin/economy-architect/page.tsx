"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface EconomySettings {
  voice_enabled: boolean
  selected_voice: string
  auto_simulation: boolean
  risk_tolerance: string
  notification_threshold: number
}

interface RewardSetting {
  id: string
  feature_id: string
  feature_name: string
  base_xp_reward: number
  base_credit_cost: number
  multiplier: number
  cooldown_minutes: number
  is_active: boolean
}

interface EconomyHealth {
  overall_health: number
  xp_circulation: {
    earned_today: number
    spent_today: number
    ratio: string
  }
  credit_circulation: {
    earned_today: number
    spent_today: number
    ratio: string
  }
  badges_unlocked_today: number
  active_users_today: number
  inflation_risk: number
  stability_score: string
}

export default function EconomyArchitectPage() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [sessionId] = useState(`economy_${Date.now()}`)
  const [settings, setSettings] = useState<EconomySettings>({
    voice_enabled: true,
    selected_voice: "avelyn",
    auto_simulation: true,
    risk_tolerance: "medium",
    notification_threshold: 0.8,
  })
  const [rewardSettings, setRewardSettings] = useState<RewardSetting[]>([])
  const [economyHealth, setEconomyHealth] = useState<EconomyHealth | null>(null)
  const [textInput, setTextInput] = useState("")
  const [selectedFeature, setSelectedFeature] = useState("")
  const [pendingChanges, setPendingChanges] = useState<any[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Mock admin ID - in real app, get from auth context
  const adminId = "admin-user-id"

  useEffect(() => {
    loadInitialData()
    // Auto-greet the admin
    setTimeout(() => {
      if (settings.voice_enabled) {
        processCommand("greeting")
      }
    }, 1000)
  }, [])

  const loadInitialData = async () => {
    try {
      // Load reward settings
      const settingsResponse = await callEconomyFunction("getRewardSettings", {})
      if (settingsResponse.success) {
        setRewardSettings(settingsResponse.result.settings)
      }

      // Load economy health
      const healthResponse = await callEconomyFunction("getTokenomicsBalance", {})
      if (healthResponse.success) {
        setEconomyHealth(healthResponse.result)
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast.error("Failed to load economy data")
    }
  }

  const callEconomyFunction = async (functionName: string, parameters: any) => {
    const response = await fetch("/api/admin/economy-architect/functions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function_name: functionName,
        parameters,
        admin_id: adminId,
        session_id: sessionId,
      }),
    })
    return await response.json()
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
      toast.success("Listening... Speak your economy command")
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
      const response = await fetch("/api/admin/economy-architect/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          audioData,
          textInput: textCommand,
          sessionId,
          adminId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.transcript) {
          setTranscript(data.transcript)
        }
        if (data.ai_response) {
          setAiResponse(data.ai_response)
          if (settings.voice_enabled && settings.selected_voice) {
            await speakResponse(data.ai_response)
          }
        }

        // Handle function results
        if (data.function_result) {
          handleFunctionResult(data.action_taken, data.function_result)
        }

        toast.success("Command processed successfully")
      } else {
        toast.error(data.error || "Failed to process command")
      }
    } catch (error) {
      console.error("Voice command error:", error)
      toast.error("Failed to process voice command")
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = async (text: string) => {
    setIsSpeaking(true)

    try {
      const response = await fetch("/api/admin/economy-architect/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "text_to_speech",
          textInput: text,
          sessionId,
          adminId,
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

  const processCommand = (command: string) => {
    if (command.trim()) {
      processVoiceCommand("process_command", undefined, command)
    }
  }

  const handleTextCommand = () => {
    if (textInput.trim()) {
      processCommand(textInput)
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

  const handleFunctionResult = (actionType: string, result: any) => {
    switch (actionType) {
      case "economy_health_check":
        setEconomyHealth(result)
        break
      case "badge_forecast_analysis":
        // Handle badge forecast display
        break
      case "trend_analysis":
        // Handle trend analysis display
        break
      case "impact_simulation":
        // Handle simulation results
        break
      default:
        console.log("Unhandled action type:", actionType)
    }
  }

  const applyRewardChange = async (featureId: string, changes: any) => {
    try {
      const response = await callEconomyFunction("updateRewardLogic", {
        feature_id: featureId,
        ...changes,
        reason: "Admin adjustment via Economy Architect",
      })

      if (response.success) {
        toast.success(`Reward settings updated for ${featureId}`)
        loadInitialData() // Refresh data
      } else {
        toast.error("Failed to update reward settings")
      }
    } catch (error) {
      console.error("Failed to apply reward change:", error)
      toast.error("Failed to apply changes")
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-400" />
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    return <AlertTriangle className="h-5 w-5 text-red-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Giftverse Economy Architect</h1>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Voice AI
            </Badge>
          </div>
          <p className="text-purple-200 text-lg">Intelligent XP, Credit & Badge Management with Voice Control</p>

          {/* Economy Health Overview */}
          {economyHealth && (
            <div className="flex items-center justify-center gap-6 bg-black/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2">
                {getHealthIcon(economyHealth.overall_health)}
                <span className={`font-bold ${getHealthColor(economyHealth.overall_health)}`}>
                  Health: {economyHealth.overall_health}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Users className="h-4 w-4" />
                <span>{economyHealth.active_users_today} Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-green-300">
                <Award className="h-4 w-4" />
                <span>{economyHealth.badges_unlocked_today} Badges Today</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-300">
                <TrendingUp className="h-4 w-4" />
                <span>Stability: {economyHealth.stability_score}</span>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="voice" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm">
            <TabsTrigger value="voice" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Voice Control
            </TabsTrigger>
            <TabsTrigger value="economy" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Economy Health
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-600">
              <Award className="h-4 w-4 mr-2" />
              Reward Settings
            </TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-purple-600">
              <Target className="h-4 w-4 mr-2" />
              Simulation
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Voice Control Tab */}
          <TabsContent value="voice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Interface */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Economy Architect AI
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Voice-enabled intelligent economy management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Voice Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isProcessing || isSpeaking}
                      className={`${
                        isListening ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                      } text-white`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-5 w-5 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="h-5 w-5 mr-2" />
                          Start Listening
                        </>
                      )}
                    </Button>

                    <Button
                      size="lg"
                      onClick={isSpeaking ? stopSpeaking : () => speakResponse(aiResponse)}
                      disabled={!aiResponse || isProcessing}
                      variant="outline"
                      className="border-purple-500 text-purple-300 hover:bg-purple-600/20"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="h-5 w-5 mr-2" />
                          Stop Speaking
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-5 w-5 mr-2" />
                          Speak Response
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Processing Indicator */}
                  {(isProcessing || isListening || isSpeaking) && (
                    <div className="text-center space-y-2">
                      <Progress value={isProcessing ? 50 : isListening ? 25 : 75} className="w-full" />
                      <p className="text-purple-300 text-sm">
                        {isListening && "🎤 Listening for economy commands..."}
                        {isProcessing && "🧠 Analyzing economy data..."}
                        {isSpeaking && "🔊 Speaking analysis..."}
                      </p>
                    </div>
                  )}

                  {/* Quick Commands */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => processCommand("check economy balance")}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-300 hover:bg-green-600/20"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Check Balance
                    </Button>
                    <Button
                      onClick={() => processCommand("badge forecast")}
                      variant="outline"
                      size="sm"
                      className="border-yellow-500 text-yellow-300 hover:bg-yellow-600/20"
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Badge Forecast
                    </Button>
                    <Button
                      onClick={() => processCommand("xp drain forecast")}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-300 hover:bg-red-600/20"
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      XP Drain
                    </Button>
                    <Button
                      onClick={() => processCommand("reward trends")}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-300 hover:bg-blue-600/20"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Trends
                    </Button>
                  </div>

                  {/* Text Input Alternative */}
                  <Separator className="bg-purple-500/20" />
                  <div className="space-y-2">
                    <Label className="text-purple-200">Or type your economy command:</Label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="e.g., 'Increase BondCraft XP by 5 points' or 'Run simulation on weekend multiplier'"
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
                </CardContent>
              </Card>

              {/* Conversation History */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">AI Conversation</CardTitle>
                  <CardDescription className="text-purple-200">
                    Session: {sessionId.split("_")[1]} • Voice: {settings.selected_voice}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transcript && (
                    <div className="space-y-2">
                      <Label className="text-purple-300">Your Command:</Label>
                      <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
                        <p className="text-blue-200">{transcript}</p>
                      </div>
                    </div>
                  )}

                  {aiResponse && (
                    <div className="space-y-2">
                      <Label className="text-purple-300">Economy Architect Response:</Label>
                      <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                        <p className="text-purple-200">{aiResponse}</p>
                      </div>
                    </div>
                  )}

                  {!transcript && !aiResponse && (
                    <div className="text-center py-8 text-purple-400">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Ready to architect your economy...</p>
                      <p className="text-sm">Try: "Check economy balance" or "What's the badge forecast?"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Economy Health Tab */}
          <TabsContent value="economy" className="space-y-6">
            {economyHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* XP Circulation */}
                <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Zap className="h-8 w-8 text-green-400" />
                      <div>
                        <p className="text-sm text-purple-300">XP Circulation</p>
                        <p className="text-lg font-bold text-white">Ratio: {economyHealth.xp_circulation.ratio}</p>
                        <p className="text-xs text-green-300">
                          {economyHealth.xp_circulation.earned_today} earned /{" "}
                          {economyHealth.xp_circulation.spent_today} spent
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Circulation */}
                <Card className="bg-black/20 backdrop-blur-sm border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-blue-400" />
                      <div>
                        <p className="text-sm text-purple-300">Credit Circulation</p>
                        <p className="text-lg font-bold text-white">Ratio: {economyHealth.credit_circulation.ratio}</p>
                        <p className="text-xs text-blue-300">
                          {economyHealth.credit_circulation.earned_today} earned /{" "}
                          {economyHealth.credit_circulation.spent_today} spent
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inflation Risk */}
                <Card className="bg-black/20 backdrop-blur-sm border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-yellow-400" />
                      <div>
                        <p className="text-sm text-purple-300">Inflation Risk</p>
                        <p className="text-lg font-bold text-white">
                          {(economyHealth.inflation_risk * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-yellow-300">
                          {economyHealth.inflation_risk < 0.2
                            ? "Low Risk"
                            : economyHealth.inflation_risk < 0.5
                              ? "Medium Risk"
                              : "High Risk"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Health */}
                <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-300">Overall Health</p>
                        <p className={`text-lg font-bold ${getHealthColor(economyHealth.overall_health)}`}>
                          {economyHealth.overall_health}%
                        </p>
                        <p className="text-xs text-purple-300">Economy Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Economy Actions */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Economy Management Actions</CardTitle>
                <CardDescription className="text-purple-200">
                  Quick actions to maintain economic balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => processCommand("run full economy analysis")}
                    variant="outline"
                    className="border-green-500 text-green-300 hover:bg-green-600/20"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Full Analysis
                  </Button>
                  <Button
                    onClick={() => processCommand("forecast next week trends")}
                    variant="outline"
                    className="border-blue-500 text-blue-300 hover:bg-blue-600/20"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Forecast Trends
                  </Button>
                  <Button
                    onClick={() => processCommand("suggest optimizations")}
                    variant="outline"
                    className="border-yellow-500 text-yellow-300 hover:bg-yellow-600/20"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize
                  </Button>
                  <Button
                    onClick={() => processCommand("emergency balance check")}
                    variant="outline"
                    className="border-red-500 text-red-300 hover:bg-red-600/20"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reward Settings Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Feature Reward Settings</CardTitle>
                <CardDescription className="text-purple-200">
                  Manage XP rewards and credit costs for each feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewardSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{setting.feature_name}</h3>
                        <p className="text-purple-300 text-sm">Feature ID: {setting.feature_id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-purple-300">XP Reward</p>
                          <p className="text-green-400 font-bold">{setting.base_xp_reward}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-purple-300">Credit Cost</p>
                          <p className="text-blue-400 font-bold">{setting.base_credit_cost}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-purple-300">Multiplier</p>
                          <p className="text-yellow-400 font-bold">{setting.multiplier}x</p>
                        </div>
                        {setting.cooldown_minutes > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-purple-300">Cooldown</p>
                            <p className="text-red-400 font-bold">{setting.cooldown_minutes}m</p>
                          </div>
                        )}
                        <Badge variant={setting.is_active ? "default" : "secondary"}>
                          {setting.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Economy Impact Simulation</CardTitle>
                <CardDescription className="text-purple-200">
                  Test proposed changes before applying them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-yellow-500/20 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-200">
                    Always run simulations before applying major economy changes. The AI will predict impact and risk
                    levels.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => processCommand("simulate increasing all XP by 20%")}
                    variant="outline"
                    className="border-green-500 text-green-300 hover:bg-green-600/20"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Simulate XP Increase
                  </Button>
                  <Button
                    onClick={() => processCommand("simulate weekend multiplier")}
                    variant="outline"
                    className="border-blue-500 text-blue-300 hover:bg-blue-600/20"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Weekend Multiplier
                  </Button>
                  <Button
                    onClick={() => processCommand("simulate new badge rewards")}
                    variant="outline"
                    className="border-yellow-500 text-yellow-300 hover:bg-yellow-600/20"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    New Badge Impact
                  </Button>
                  <Button
                    onClick={() => processCommand("simulate credit cost reduction")}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-600/20"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Credit Reduction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Settings */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Voice Assistant Settings</CardTitle>
                  <CardDescription className="text-purple-200">
                    Configure your Economy Architect AI voice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Enable Voice Assistant</Label>
                    <Switch
                      checked={settings.voice_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, voice_enabled: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-200">Voice Assistant</Label>
                    <Select
                      value={settings.selected_voice}
                      onValueChange={(value) => setSettings({ ...settings, selected_voice: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avelyn">Avelyn (Female, Warm & Professional)</SelectItem>
                        <SelectItem value="galen">Galen (Male, Deep & Poetic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Auto-run Simulations</Label>
                    <Switch
                      checked={settings.auto_simulation}
                      onCheckedChange={(checked) => setSettings({ ...settings, auto_simulation: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Risk Management */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Risk Management</CardTitle>
                  <CardDescription className="text-purple-200">
                    Configure safety thresholds and risk tolerance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-purple-200">Risk Tolerance</Label>
                    <Select
                      value={settings.risk_tolerance}
                      onValueChange={(value) => setSettings({ ...settings, risk_tolerance: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Conservative)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Aggressive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-200">
                      Alert Threshold: {(settings.notification_threshold * 100).toFixed(0)}%
                    </Label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.05"
                      value={settings.notification_threshold}
                      onChange={(e) =>
                        setSettings({ ...settings, notification_threshold: Number.parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <Alert className="border-blue-500/20 bg-blue-900/20">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-blue-200">
                      The AI will always ask for confirmation before applying changes that could affect platform
                      balance.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Session End Prompt */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <p className="text-purple-200">
                  Would you like to store this session's insights in the vault or mark any data as noise?
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => processCommand("store session insights")}
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-300 hover:bg-green-600/20"
                >
                  Store Insights
                </Button>
                <Button
                  onClick={() => processCommand("mark as noise")}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-300 hover:bg-red-600/20"
                >
                  Mark as Noise
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
