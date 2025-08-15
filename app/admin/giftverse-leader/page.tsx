"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Brain,
  EyeOff,
  Activity,
  TrendingUp,
  Users,
  Heart,
  Gift,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Headphones,
} from "lucide-react"
import { toast } from "sonner"

interface VoiceSettings {
  selected_voice: string
  voice_speed: number
  auto_speak: boolean
  stealth_mode: boolean
  analysis_mode: boolean
}

interface IntelligenceData {
  emotional?: any
  gifting?: any
  performance?: any
  users?: any
  system?: any
}

export default function GiftverseLeaderPage() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [sessionId] = useState(`giftverse_${Date.now()}`)
  const [settings, setSettings] = useState<VoiceSettings>({
    selected_voice: "avelyn",
    voice_speed: 1.0,
    auto_speak: true,
    stealth_mode: false,
    analysis_mode: false,
  })
  const [intelligence, setIntelligence] = useState<IntelligenceData>({})
  const [textInput, setTextInput] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Mock admin ID - in real app, get from auth context
  const adminId = "admin-user-id"

  useEffect(() => {
    loadSettings()
    loadIntelligence("overview")
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/admin/giftverse-leader/settings?adminId=${adminId}`)
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const updateSettings = async (newSettings: Partial<VoiceSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      const response = await fetch("/api/admin/giftverse-leader/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, settings: updatedSettings }),
      })

      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
        toast.success("Settings updated successfully")
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
      toast.error("Failed to update settings")
    }
  }

  const loadIntelligence = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/giftverse-leader/intelligence?adminId=${adminId}&type=${type}`)
      const data = await response.json()
      if (data.success) {
        setIntelligence(data.data)
      }
    } catch (error) {
      console.error("Failed to load intelligence:", error)
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
      toast.success("Listening... Speak your command")
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
      const response = await fetch("/api/admin/giftverse-leader/voice", {
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
        if (data.spoken_response) {
          setResponse(data.spoken_response)
          if (settings.auto_speak) {
            await speakResponse(data.spoken_response)
          }
        }

        // Handle next actions
        if (data.next_action) {
          handleNextAction(data.next_action)
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
      const response = await fetch("/api/admin/giftverse-leader/voice", {
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

  const handleNextAction = (action: string) => {
    switch (action) {
      case "render_emotional_insights_chart":
        loadIntelligence("emotional_trends")
        break
      case "render_gifting_patterns_dashboard":
        loadIntelligence("gifting_patterns")
        break
      case "render_feature_performance_metrics":
        loadIntelligence("feature_performance")
        break
      case "render_badge_analytics":
        loadIntelligence("user_behavior")
        break
      case "update_voice_settings":
        loadSettings()
        break
      default:
        console.log("Unknown action:", action)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Giftverse Leader AI Dashboard</h1>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>
          <p className="text-purple-200 text-lg">
            Voice-Interactive Strategic Intelligence for the AgentGift.AI Ecosystem
          </p>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4">
            {settings.stealth_mode && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                <EyeOff className="h-3 w-3 mr-1" />
                Stealth Mode
              </Badge>
            )}
            {settings.analysis_mode && (
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                <BarChart3 className="h-3 w-3 mr-1" />
                Analysis Mode
              </Badge>
            )}
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="voice" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm">
            <TabsTrigger value="voice" className="data-[state=active]:bg-purple-600">
              <Headphones className="h-4 w-4 mr-2" />
              Voice Control
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
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
                    <MessageSquare className="h-5 w-5" />
                    Voice Interface
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Speak directly to the Giftverse Mastermind AI
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
                      onClick={isSpeaking ? stopSpeaking : () => speakResponse(response)}
                      disabled={!response || isProcessing}
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
                        {isListening && "🎤 Listening for your command..."}
                        {isProcessing && "🧠 Processing your request..."}
                        {isSpeaking && "🔊 Speaking response..."}
                      </p>
                    </div>
                  )}

                  {/* Text Input Alternative */}
                  <Separator className="bg-purple-500/20" />
                  <div className="space-y-2">
                    <Label className="text-purple-200">Or type your command:</Label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your strategic command here..."
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
                  <CardTitle className="text-white">Conversation</CardTitle>
                  <CardDescription className="text-purple-200">
                    Current session: {sessionId.split("_")[1]}
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

                  {response && (
                    <div className="space-y-2">
                      <Label className="text-purple-300">AI Response:</Label>
                      <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                        <p className="text-purple-200">{response}</p>
                      </div>
                    </div>
                  )}

                  {!transcript && !response && (
                    <div className="text-center py-8 text-purple-400">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ready to receive your strategic commands...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quick Intelligence Cards */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-pink-400" />
                    <div>
                      <p className="text-sm text-purple-300">Top Emotion</p>
                      <p className="text-lg font-bold text-white">{intelligence.emotional?.topEmotion || "Joy"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Gift className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-sm text-purple-300">Gifting Actions</p>
                      <p className="text-lg font-bold text-white">{intelligence.gifting?.totalActions || "1,247"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-purple-300">Daily Active</p>
                      <p className="text-lg font-bold text-white">{intelligence.users?.dailyActive || "892"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-yellow-400" />
                    <div>
                      <p className="text-sm text-purple-300">System Health</p>
                      <p className="text-lg font-bold text-white">{intelligence.system?.health || "Excellent"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Intelligence Actions */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Strategic Intelligence Commands</CardTitle>
                <CardDescription className="text-purple-200">Quick access to key intelligence reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => loadIntelligence("emotional_trends")}
                    variant="outline"
                    className="border-pink-500 text-pink-300 hover:bg-pink-600/20"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Emotional Trends
                  </Button>
                  <Button
                    onClick={() => loadIntelligence("gifting_patterns")}
                    variant="outline"
                    className="border-green-500 text-green-300 hover:bg-green-600/20"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Gifting Patterns
                  </Button>
                  <Button
                    onClick={() => loadIntelligence("feature_performance")}
                    variant="outline"
                    className="border-blue-500 text-blue-300 hover:bg-blue-600/20"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Feature Performance
                  </Button>
                  <Button
                    onClick={() => loadIntelligence("platform_health")}
                    variant="outline"
                    className="border-yellow-500 text-yellow-300 hover:bg-yellow-600/20"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Platform Health
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Platform Analytics</CardTitle>
                <CardDescription className="text-purple-200">
                  Comprehensive platform performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-purple-400">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Analytics Dashboard</p>
                  <p className="text-sm">Use voice commands to generate specific analytics reports</p>
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
                    Customize your AI voice interaction experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-purple-200">Voice Assistant</Label>
                    <Select
                      value={settings.selected_voice}
                      onValueChange={(value) => updateSettings({ selected_voice: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avelyn">Avelyn (Warm & Friendly)</SelectItem>
                        <SelectItem value="galen">Galen (Deep & Analytical)</SelectItem>
                        <SelectItem value="sage">Sage (Wise & Measured)</SelectItem>
                        <SelectItem value="echo">Echo (Clear & Professional)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-200">Voice Speed: {settings.voice_speed}x</Label>
                    <Slider
                      value={[settings.voice_speed]}
                      onValueChange={([value]) => updateSettings({ voice_speed: value })}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Auto-speak responses</Label>
                    <Switch
                      checked={settings.auto_speak}
                      onCheckedChange={(checked) => updateSettings({ auto_speak: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">System Settings</CardTitle>
                  <CardDescription className="text-purple-200">Advanced system configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-purple-200">Stealth Mode</Label>
                      <p className="text-sm text-purple-400">Discrete logging for sensitive operations</p>
                    </div>
                    <Switch
                      checked={settings.stealth_mode}
                      onCheckedChange={(checked) => updateSettings({ stealth_mode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-purple-200">Analysis Mode</Label>
                      <p className="text-sm text-purple-400">Enhanced intelligence processing</p>
                    </div>
                    <Switch
                      checked={settings.analysis_mode}
                      onCheckedChange={(checked) => updateSettings({ analysis_mode: checked })}
                    />
                  </div>

                  <Separator className="bg-purple-500/20" />

                  <div className="space-y-2">
                    <Label className="text-purple-200">Session Information</Label>
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-purple-300">Session ID: {sessionId}</p>
                      <p className="text-sm text-purple-300">Admin ID: {adminId}</p>
                      <p className="text-sm text-purple-300">Status: Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

