"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  Lock,
  Unlock,
  Activity,
  Users,
  BarChart3,
  Zap,
  Heart,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"

interface AuthState {
  authorized: boolean
  adminRole?: string
  permissions?: any
  voiceName?: string
  voiceSettings?: any
  welcomeMessage?: string
  sessionId?: string
  userName?: string
}

interface VoiceSession {
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  transcript: string
  aiResponse: string
  commandCategory: string
  executionStatus: string
}

export default function VoiceGuardianPage() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({ authorized: false })
  const [voiceSession, setVoiceSession] = useState<VoiceSession>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: "",
    aiResponse: "",
    commandCategory: "",
    executionStatus: "",
  })
  const [textInput, setTextInput] = useState("")
  const [sessionId] = useState(`voice_guardian_${Date.now()}`)
  const [interactionCount, setInteractionCount] = useState(0)
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Mock user ID - in real app, get from auth context
  const userId = "admin-user-id"

  useEffect(() => {
    authenticateUser()
  }, [])

  const authenticateUser = async () => {
    setIsAuthenticating(true)
    try {
      const response = await fetch("/api/admin/voice-guardian/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sessionId }),
      })

      const data = await response.json()

      if (data.authorized) {
        setAuthState(data)
        // Speak welcome message
        if (data.welcomeMessage && data.voiceSettings?.auto_speak) {
          await speakMessage(data.welcomeMessage)
        }
        toast.success("Voice command center activated")
      } else {
        // Speak access denied message
        if (data.voiceMessage) {
          await speakMessage(data.voiceMessage)
        }
        toast.error(data.error || "Access denied")
        // Redirect after a delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
    } catch (error) {
      console.error("Authentication error:", error)
      toast.error("Authentication system error")
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } finally {
      setIsAuthenticating(false)
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
            processVoiceInteraction("speech_to_text", base64Audio)
          }
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setVoiceSession((prev) => ({ ...prev, isListening: true }))
      toast.success("Listening for voice command...")
    } catch (error) {
      console.error("Failed to start listening:", error)
      toast.error("Failed to access microphone")
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && voiceSession.isListening) {
      mediaRecorderRef.current.stop()
      setVoiceSession((prev) => ({ ...prev, isListening: false }))
    }
  }

  const processVoiceInteraction = async (action: string, audioData?: string, textCommand?: string) => {
    setVoiceSession((prev) => ({ ...prev, isProcessing: true }))

    try {
      const response = await fetch("/api/admin/voice-guardian/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          audioData,
          textInput: textCommand,
          sessionId: authState.sessionId,
          userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVoiceSession((prev) => ({
          ...prev,
          transcript: data.transcript || textCommand || "",
          aiResponse: data.aiResponse || "",
          commandCategory: data.commandCategory || "",
          executionStatus: data.executionStatus || "",
        }))

        setInteractionCount((prev) => prev + 1)

        // Speak AI response if auto-speak is enabled
        if (data.shouldSpeak && data.aiResponse) {
          await speakMessage(data.aiResponse)
        }

        // Handle session ending
        if (data.executionStatus === "session_ending") {
          setTimeout(() => {
            endSession()
          }, 2000)
        }

        toast.success("Command processed successfully")
      } else {
        toast.error(data.error || "Failed to process command")
        if (data.voiceMessage) {
          await speakMessage(data.voiceMessage)
        }
      }
    } catch (error) {
      console.error("Voice interaction error:", error)
      toast.error("Voice interaction failed")
    } finally {
      setVoiceSession((prev) => ({ ...prev, isProcessing: false }))
    }
  }

  const speakMessage = async (message: string) => {
    setVoiceSession((prev) => ({ ...prev, isSpeaking: true }))

    try {
      const response = await fetch("/api/admin/voice-guardian/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "text_to_speech",
          textInput: message,
          sessionId: authState.sessionId,
          userId,
        }),
      })

      const data = await response.json()

      if (data.success && data.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioData}`)
        audioRef.current = audio

        audio.onended = () => setVoiceSession((prev) => ({ ...prev, isSpeaking: false }))
        audio.onerror = () => {
          setVoiceSession((prev) => ({ ...prev, isSpeaking: false }))
          toast.error("Failed to play audio response")
        }

        await audio.play()
      }
    } catch (error) {
      console.error("Text-to-speech error:", error)
      setVoiceSession((prev) => ({ ...prev, isSpeaking: false }))
      toast.error("Failed to generate speech")
    }
  }

  const handleTextCommand = () => {
    if (textInput.trim()) {
      processVoiceInteraction("process_command", undefined, textInput)
      setTextInput("")
    }
  }

  const endSession = async () => {
    try {
      const response = await fetch(`/api/admin/voice-guardian/auth?sessionId=${authState.sessionId}&userId=${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.voiceMessage) {
        await speakMessage(data.voiceMessage)
      }

      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (error) {
      console.error("Session end error:", error)
      router.push("/admin")
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setVoiceSession((prev) => ({ ...prev, isSpeaking: false }))
    }
  }

  // Loading/Authentication screen
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-96 bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Voice Guardian</h2>
              <p className="text-purple-200">Authenticating admin access...</p>
            </div>
            <Progress value={75} className="w-full" />
            <p className="text-sm text-purple-300">Verifying credentials and initializing voice systems</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access denied screen
  if (!authState.authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <Card className="w-96 bg-black/40 backdrop-blur-sm border-red-500/30">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <Alert className="bg-red-900/30 border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-red-200">Access Denied</AlertTitle>
              <AlertDescription className="text-red-100">
                You are not authorized for command center entry. Redirecting...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Voice Guardian Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Unlock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Voice Command Center</h1>
            <Badge variant="secondary" className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Authorized
            </Badge>
          </div>
          <p className="text-purple-200 text-lg">
            Welcome {authState.userName} • Voice: {authState.voiceName} • Role: {authState.adminRole}
          </p>

          {/* Session Status */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Activity className="h-3 w-3 mr-1" />
              Session Active
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              <MessageSquare className="h-3 w-3 mr-1" />
              {interactionCount} Interactions
            </Badge>
            <Button
              onClick={endSession}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-400 hover:bg-red-600/20 bg-transparent"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Exit Command Center
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Interface */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Voice Interface
              </CardTitle>
              <CardDescription className="text-purple-200">
                Speak your commands to the Giftverse AI system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={voiceSession.isListening ? stopListening : startListening}
                  disabled={voiceSession.isProcessing || voiceSession.isSpeaking}
                  className={`${
                    voiceSession.isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  } text-white min-w-[140px]`}
                >
                  {voiceSession.isListening ? (
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
                  onClick={voiceSession.isSpeaking ? stopSpeaking : () => speakMessage(voiceSession.aiResponse)}
                  disabled={!voiceSession.aiResponse || voiceSession.isProcessing}
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-600/20 min-w-[140px]"
                >
                  {voiceSession.isSpeaking ? (
                    <>
                      <VolumeX className="h-5 w-5 mr-2" />
                      Stop Speaking
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5 mr-2" />
                      Repeat Response
                    </>
                  )}
                </Button>
              </div>

              {/* Status Indicator */}
              {(voiceSession.isProcessing || voiceSession.isListening || voiceSession.isSpeaking) && (
                <div className="text-center space-y-3">
                  <Progress
                    value={voiceSession.isListening ? 25 : voiceSession.isProcessing ? 50 : 75}
                    className="w-full"
                  />
                  <div className="flex items-center justify-center gap-2">
                    {voiceSession.isListening && (
                      <>
                        <Mic className="h-4 w-4 text-green-400 animate-pulse" />
                        <span className="text-green-400">Listening for command...</span>
                      </>
                    )}
                    {voiceSession.isProcessing && (
                      <>
                        <Brain className="h-4 w-4 text-blue-400 animate-spin" />
                        <span className="text-blue-400">Processing command...</span>
                      </>
                    )}
                    {voiceSession.isSpeaking && (
                      <>
                        <Volume2 className="h-4 w-4 text-purple-400 animate-pulse" />
                        <span className="text-purple-400">Speaking response...</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Text Input Alternative */}
              <Separator className="bg-purple-500/20" />
              <div className="space-y-3">
                <Label className="text-purple-200">Alternative: Type Command</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your command here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300"
                    rows={2}
                  />
                  <Button
                    onClick={handleTextCommand}
                    disabled={!textInput.trim() || voiceSession.isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Command History & Response */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Command History</CardTitle>
              <CardDescription className="text-purple-200">Current session interactions and responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {voiceSession.transcript && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <Label className="text-blue-300">Your Command:</Label>
                    {voiceSession.commandCategory && (
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                        {voiceSession.commandCategory}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
                    <p className="text-blue-200">{voiceSession.transcript}</p>
                  </div>
                </div>
              )}

              {voiceSession.aiResponse && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-400" />
                    <Label className="text-purple-300">AI Response:</Label>
                    {voiceSession.executionStatus && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          voiceSession.executionStatus === "completed"
                            ? "border-green-500 text-green-400"
                            : voiceSession.executionStatus === "session_ending"
                              ? "border-yellow-500 text-yellow-400"
                              : "border-gray-500 text-gray-400"
                        }`}
                      >
                        {voiceSession.executionStatus === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {voiceSession.executionStatus === "session_ending" && <LogOut className="h-3 w-3 mr-1" />}
                        {voiceSession.executionStatus}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                    <p className="text-purple-200">{voiceSession.aiResponse}</p>
                  </div>
                </div>
              )}

              {!voiceSession.transcript && !voiceSession.aiResponse && (
                <div className="text-center py-8 text-purple-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Ready for Commands</p>
                  <p className="text-sm">Available commands:</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <p>• "Show XP Leaderboard"</p>
                    <p>• "Log XP reward for feature"</p>
                    <p>• "Export today's activity"</p>
                    <p>• "Summon Tokenomics Bot"</p>
                    <p>• "Voice summary of emotional shifts"</p>
                    <p>• "Exit voice command center"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Command Buttons */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Commands</CardTitle>
            <CardDescription className="text-purple-200">
              Click to execute common administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                onClick={() => processVoiceInteraction("process_command", undefined, "Show XP Leaderboard")}
                variant="outline"
                className="border-yellow-500 text-yellow-300 hover:bg-yellow-600/20"
                disabled={voiceSession.isProcessing}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                XP Leaderboard
              </Button>
              <Button
                onClick={() => processVoiceInteraction("process_command", undefined, "Export today's activity")}
                variant="outline"
                className="border-green-500 text-green-300 hover:bg-green-600/20"
                disabled={voiceSession.isProcessing}
              >
                <Activity className="h-4 w-4 mr-2" />
                Export Activity
              </Button>
              <Button
                onClick={() => processVoiceInteraction("process_command", undefined, "Summon Tokenomics Bot")}
                variant="outline"
                className="border-blue-500 text-blue-300 hover:bg-blue-600/20"
                disabled={voiceSession.isProcessing}
              >
                <Zap className="h-4 w-4 mr-2" />
                Tokenomics Bot
              </Button>
              <Button
                onClick={() =>
                  processVoiceInteraction("process_command", undefined, "Voice summary of emotional shifts")
                }
                variant="outline"
                className="border-pink-500 text-pink-300 hover:bg-pink-600/20"
                disabled={voiceSession.isProcessing}
              >
                <Heart className="h-4 w-4 mr-2" />
                Emotional Shifts
              </Button>
              <Button
                onClick={() => processVoiceInteraction("process_command", undefined, "Log XP reward for feature")}
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-600/20"
                disabled={voiceSession.isProcessing}
              >
                <Users className="h-4 w-4 mr-2" />
                Log XP Reward
              </Button>
              <Button
                onClick={endSession}
                variant="outline"
                className="border-red-500 text-red-300 hover:bg-red-600/20 bg-transparent"
                disabled={voiceSession.isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Exit Center
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center text-purple-300 text-sm italic border-t border-purple-500/30 pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span>Secure Voice Command Center • Session: {authState.sessionId?.slice(-8)}</span>
          </div>
          <p>"Voice-authenticated. Command-ready. The Giftverse responds to your strategic vision."</p>
        </div>
      </div>
    </div>
  )
}
