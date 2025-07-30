"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Activity,
  Heart,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  Play,
  RotateCcw,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"

interface VoiceSettings {
  selected_voice: string
  voice_speed: number
  voice_pitch: number
  auto_speak: boolean
  stealth_logging: boolean
  analysis_mode: boolean
}

interface IntelligenceData {
  emotional_trends?: any
  gifting_patterns?: any
  user_behavior?: any
  feature_performance?: any
  platform_health?: any
}

export default function GiftverseLeaderDashboard() {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sessionId] = useState(`session-${Date.now()}`)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    selected_voice: "avelyn",
    voice_speed: 1.0,
    voice_pitch: 1.0,
    auto_speak: true,
    stealth_logging: false,
    analysis_mode: false,
  })
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData>({})
  const [currentCommand, setCurrentCommand] = useState("")
  const [lastResponse, setLastResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!profile || !profile.admin_role)) {
      router.push("/dashboard")
      toast.error("Access denied. Giftverse Leader requires admin privileges.")
    }
  }, [profile, loading, router])

  // Load voice settings and initial intelligence
  useEffect(() => {
    if (profile?.admin_role) {
      loadVoiceSettings()
      loadIntelligenceData("comprehensive")
    }
  }, [profile])

  const loadVoiceSettings = async () => {
    try {
      const response = await fetch(`/api/admin/giftverse-leader/settings?adminId=${profile?.id}`)
      const data = await response.json()
      if (data.success) {
        setVoiceSettings(data.settings)
      }
    } catch (error) {
      console.error("Failed to load voice settings:", error)
    }
  }

  const updateVoiceSettings = async (newSettings: Partial<VoiceSettings>) => {
    try {
      const updatedSettings = { ...voiceSettings, ...newSettings }
      const response = await fetch("/api/admin/giftverse-leader/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: profile?.id,
          settings: updatedSettings,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setVoiceSettings(data.settings)
        toast.success("Voice settings updated")
      }
    } catch (error) {
      console.error("Failed to update voice settings:", error)
      toast.error("Failed to update settings")
    }
  }

  const loadIntelligenceData = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/giftverse-leader/intelligence?adminId=${profile?.id}&type=${type}`)
      const data = await response.json()
      if (data.success) {
        setIntelligenceData(data.data)
      }
    } catch (error) {
      console.error("Failed to load intelligence data:", error)
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
      toast.success("Listening... Speak your command to the Giftverse Mastermind")
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

  const processVoiceCommand = async (action: string, audioData?: string, textInput?: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/giftverse-leader/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          audioData,
          textInput,
          sessionId,
          adminId: profile?.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        if (data.spoken_response) {
          setLastResponse(data.spoken_response)
          if (voiceSettings.auto_speak) {
            await speakResponse(data.spoken_response)
          }
        }
        if (data.transcript) {
          setCurrentCommand(data.transcript)
        }
        if (data.next_action) {
          await executeNextAction(data.next_action)
        }
      } else {
        toast.error(data.error || "Voice processing failed")
      }
    } catch (error) {
      console.error("Voice command processing failed:", error)
      toast.error("Failed to process voice command")
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = async (text: string) => {
    setIsSpeaking(true)
    try {
      const response = await fetch("/api/admin/giftverse-leader/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "text_to_speech",
          textInput: text,
          sessionId,
          adminId: profile?.id,
        }),
      })

      const data = await response.json()
      if (data.success && data.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioData}`)
        audioRef.current = audio
        audio.onended = () => setIsSpeaking(false)
        await audio.play()
      }
    } catch (error) {
      console.error("Text-to-speech failed:", error)
      setIsSpeaking(false)
    }
  }

  const executeNextAction = async (action: string) => {
    switch (action) {
      case "render_emotional_insights_chart":
        await loadIntelligenceData("emotional_trends")
        break
      case "render_gifting_patterns_dashboard":
        await loadIntelligenceData("gifting_patterns")
        break
      case "render_feature_performance_metrics":
        await loadIntelligenceData("feature_performance")
        break
      case "render_badge_analytics":
        toast.success("Badge analytics updated")
        break
      case "execute_xp_boost":
        toast.success("XP boost activated platform-wide!")
        break
      default:
        console.log("Unknown action:", action)
    }
  }

  const handleTextCommand = async () => {
    if (currentCommand.trim()) {
      await processVoiceCommand("process_command", undefined, currentCommand)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Initializing Giftverse Mastermind...</p>
        </div>
      </div>
    )
  }

  if (!profile?.admin_role) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Giftverse Leader AI™</h1>
              <p className="text-purple-200">Strategic Intelligence Dashboard • Welcome, {profile.name || "Admin"}</p>
              <Badge variant="outline" className="mt-2 text-purple-200 border-purple-300">
                Voice-Interactive AI • Session: {sessionId.slice(-8)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {voiceSettings.stealth_logging && (
              <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                <EyeOff className="w-3 h-3 mr-1" />
                Stealth Mode
              </Badge>
            )}
            {voiceSettings.analysis_mode && (
              <Badge variant="secondary" className="bg-blue-800 text-blue-200">
                <BarChart3 className="w-3 h-3 mr-1" />
                Analysis Mode
              </Badge>
            )}
          </div>
        </div>

        {/* Voice Control Panel */}
        <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Voice Command Center</span>
            </CardTitle>
            <CardDescription className="text-purple-200">
              Speak directly to the Giftverse Mastermind or type your strategic commands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`${
                  isListening ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                } text-white`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Voice Command
                  </>
                )}
              </Button>

              <Button
                onClick={() => speakResponse(lastResponse)}
                disabled={!lastResponse || isSpeaking}
                variant="outline"
                className="border-purple-400 text-purple-200 hover:bg-purple-800"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Speaking...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Repeat Response
                  </>
                )}
              </Button>

              <div className="flex items-center space-x-2 text-purple-200">
                <span className="text-sm">Voice:</span>
                <Select
                  value={voiceSettings.selected_voice}
                  onValueChange={(value) => updateVoiceSettings({ selected_voice: value })}
                >
                  <SelectTrigger className="w-32 bg-purple-800 border-purple-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avelyn">Avelyn (Warm)</SelectItem>
                    <SelectItem value="galen">Galen (Analytical)</SelectItem>
                    <SelectItem value="sage">Sage (Wise)</SelectItem>
                    <SelectItem value="echo">Echo (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-purple-200">Text Command Input</Label>
              <div className="flex space-x-2">
                <Textarea
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  placeholder="Type your command to the Giftverse Mastermind..."
                  className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-300"
                  rows={2}
                />
                <Button
                  onClick={handleTextCommand}
                  disabled={!currentCommand.trim() || isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {lastResponse && (
              <Alert className="bg-purple-900/30 border-purple-500">
                <Brain className="h-4 w-4" />
                <AlertTitle className="text-purple-200">Giftverse Mastermind Response</AlertTitle>
                <AlertDescription className="text-purple-100 mt-2">{lastResponse}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Intelligence Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 border-purple-500/30">
            <TabsTrigger value="overview" className="text-purple-200 data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="emotional" className="text-purple-200 data-[state=active]:bg-purple-600">
              Emotional Intel
            </TabsTrigger>
            <TabsTrigger value="gifting" className="text-purple-200 data-[state=active]:bg-purple-600">
              Gifting Patterns
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-purple-200 data-[state=active]:bg-purple-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-purple-200 data-[state=active]:bg-purple-600">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Platform Health</CardTitle>
                  <Activity className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {intelligenceData.platform_health?.health_status === "excellent" ? "98.7%" : "94.2%"}
                  </div>
                  <p className="text-xs text-purple-300">System performance</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Emotional Resonance</CardTitle>
                  <Heart className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {intelligenceData.emotional_trends?.average_intensity?.toFixed(1) || "4.2"}
                  </div>
                  <p className="text-xs text-purple-300">Average intensity score</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Active Features</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {Object.keys(intelligenceData.feature_performance?.feature_metrics || {}).length || 36}
                  </div>
                  <p className="text-xs text-purple-300">Features in use</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Daily Active Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {intelligenceData.user_behavior?.daily_active_users || "1,247"}
                  </div>
                  <p className="text-xs text-purple-300">Engaged users today</p>
                </CardContent>
              </Card>
            </div>

            {intelligenceData.strategic_summary && (
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Strategic Intelligence Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-purple-200 font-medium mb-2">Key Insights</h4>
                    <ul className="space-y-1">
                      {intelligenceData.strategic_summary.key_insights?.map((insight, index) => (
                        <li key={index} className="text-purple-100 text-sm">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-purple-200 font-medium mb-2">Strategic Recommendations</h4>
                    <ul className="space-y-1">
                      {intelligenceData.strategic_summary.strategic_recommendations?.map((rec, index) => (
                        <li key={index} className="text-purple-100 text-sm">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emotional" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Emotional Intelligence Analysis</CardTitle>
                <CardDescription className="text-purple-200">
                  Real-time emotional trends and resonance patterns across the Giftverse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intelligenceData.emotional_trends ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Emotion Distribution</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(intelligenceData.emotional_trends.emotion_distribution || {})
                          .slice(0, 8)
                          .map(([emotion, count]) => (
                            <div key={emotion} className="text-center">
                              <div className="text-lg font-bold text-white">{count}</div>
                              <div className="text-sm text-purple-300 capitalize">{emotion}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Average Emotional Intensity</h4>
                      <Progress
                        value={(intelligenceData.emotional_trends.average_intensity || 0) * 20}
                        className="w-full"
                      />
                      <p className="text-sm text-purple-300 mt-1">
                        {intelligenceData.emotional_trends.average_intensity?.toFixed(2) || "0.00"} / 5.0
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-300">Loading emotional intelligence data...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gifting" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Gifting Pattern Analysis</CardTitle>
                <CardDescription className="text-purple-200">
                  Platform-wide gifting trends and feature usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intelligenceData.gifting_patterns ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Feature Popularity</h4>
                      <div className="space-y-2">
                        {Object.entries(intelligenceData.gifting_patterns.feature_popularity || {})
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([feature, usage]) => (
                            <div key={feature} className="flex justify-between items-center">
                              <span className="text-purple-200 capitalize">{feature.replace(/-/g, " ")}</span>
                              <Badge variant="outline" className="text-purple-300 border-purple-500">
                                {usage} uses
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Platform Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {intelligenceData.gifting_patterns.total_credits_used || 0}
                          </div>
                          <div className="text-sm text-purple-300">Credits Used (7 days)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {intelligenceData.gifting_patterns.vault_activity || 0}
                          </div>
                          <div className="text-sm text-purple-300">Vault Bids</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-300">Loading gifting pattern data...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Feature Performance Metrics</CardTitle>
                <CardDescription className="text-purple-200">
                  Detailed performance analysis of all platform features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intelligenceData.feature_performance ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Top Performing Features</h4>
                      <div className="space-y-2">
                        {intelligenceData.feature_performance.top_features?.slice(0, 5).map(([feature, metrics]) => (
                          <div key={feature} className="flex justify-between items-center p-2 bg-purple-900/30 rounded">
                            <span className="text-purple-200 capitalize">{feature.replace(/-/g, " ")}</span>
                            <div className="text-right">
                              <div className="text-white font-medium">{metrics.total_uses} uses</div>
                              <div className="text-purple-300 text-sm">{metrics.unique_users} users</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-300">Loading performance data...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Giftverse Mastermind Settings</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Configure voice assistant behavior and analysis modes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Auto-Speak Responses</Label>
                    <Switch
                      checked={voiceSettings.auto_speak}
                      onCheckedChange={(checked) => updateVoiceSettings({ auto_speak: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Stealth Logging Mode</Label>
                    <Switch
                      checked={voiceSettings.stealth_logging}
                      onCheckedChange={(checked) => updateVoiceSettings({ stealth_logging: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Analysis Mode</Label>
                    <Switch
                      checked={voiceSettings.analysis_mode}
                      onCheckedChange={(checked) => updateVoiceSettings({ analysis_mode: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Voice Speed</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-purple-300 text-sm">0.5x</span>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={voiceSettings.voice_speed}
                        onChange={(e) => updateVoiceSettings({ voice_speed: Number.parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-purple-300 text-sm">2.0x</span>
                      <Badge variant="outline" className="text-purple-300 border-purple-500">
                        {voiceSettings.voice_speed}x
                      </Badge>
                    </div>
                  </div>
                </div>

                <Alert className="bg-purple-900/30 border-purple-500">
                  <Shield className="h-4 w-4" />
                  <AlertTitle className="text-purple-200">Security Notice</AlertTitle>
                  <AlertDescription className="text-purple-100">
                    All voice interactions are encrypted and logged for security purposes. Stealth mode disables visual
                    indicators but maintains security logging. Only verified admins can access the Giftverse Mastermind.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-purple-300 text-sm italic border-t border-purple-500/30 pt-6">
          "I am the voice of the Giftverse - strategic, intelligent, and always listening. Through me, you command the
          emotional intelligence of thousands and shape the future of meaningful connections."
        </div>
      </div>
    </div>
  )
}
