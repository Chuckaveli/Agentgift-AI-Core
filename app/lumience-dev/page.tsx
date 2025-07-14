"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, Mic, MicOff, CameraOff, Shield, Activity, Volume2 } from "lucide-react"

// Types for emotion detection
interface EmotionState {
  primary: string
  confidence: number
  timestamp: number
  faceMetrics: {
    browHeight: number
    mouthCurve: number
    eyeOpenness: number
  }
  voiceMetrics: {
    volume: number
    pitch: number
    energy: number
  }
}

interface FaceLandmarks {
  keypoints: Array<{
    x: number
    y: number
    z?: number
    name?: string
  }>
}

export default function LumienceDevPage() {
  const [isActive, setIsActive] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState | null>(null)
  const [emotionHistory, setEmotionHistory] = useState<EmotionState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissions, setPermissions] = useState({ camera: false, microphone: false })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize TensorFlow face detection
  const initializeFaceDetection = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues
      const tf = await import("@tensorflow/tfjs")
      const faceDetection = await import("@tensorflow-models/face-landmarks-detection")

      await tf.ready()

      const model = faceDetection.SupportedModels.MediaPipeFaceMesh
      const detectorConfig = {
        runtime: "tfjs" as const,
        refineLandmarks: true,
      }

      detectorRef.current = await faceDetection.createDetector(model, detectorConfig)
      return true
    } catch (err) {
      console.error("Failed to initialize face detection:", err)
      setError("Failed to load face detection model")
      return false
    }
  }, [])

  // Initialize audio analysis
  const initializeAudioAnalysis = useCallback(async (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      return true
    } catch (err) {
      console.error("Failed to initialize audio analysis:", err)
      return false
    }
  }, [])

  // Analyze face landmarks for emotion
  const analyzeFaceEmotion = useCallback((landmarks: FaceLandmarks) => {
    if (!landmarks.keypoints || landmarks.keypoints.length === 0) {
      return { browHeight: 0, mouthCurve: 0, eyeOpenness: 0 }
    }

    const keypoints = landmarks.keypoints

    // Simplified emotion detection based on key facial points
    // In a real implementation, you'd use more sophisticated algorithms

    // Brow height (higher = surprised/worried, lower = angry/focused)
    const leftBrow = keypoints.find((p) => p.name?.includes("leftEyebrow"))
    const rightBrow = keypoints.find((p) => p.name?.includes("rightEyebrow"))
    const browHeight = leftBrow && rightBrow ? Math.abs((leftBrow.y + rightBrow.y) / 2 - 100) / 50 : 0.5

    // Mouth curve (positive = smile, negative = frown)
    const leftMouth = keypoints.find((p) => p.name?.includes("leftMouth"))
    const rightMouth = keypoints.find((p) => p.name?.includes("rightMouth"))
    const centerMouth = keypoints.find((p) => p.name?.includes("centerMouth"))
    const mouthCurve =
      leftMouth && rightMouth && centerMouth ? (centerMouth.y - (leftMouth.y + rightMouth.y) / 2) / 20 : 0

    // Eye openness
    const leftEye = keypoints.find((p) => p.name?.includes("leftEye"))
    const rightEye = keypoints.find((p) => p.name?.includes("rightEye"))
    const eyeOpenness = leftEye && rightEye ? Math.min(1, Math.abs(leftEye.y - rightEye.y) / 10) : 0.5

    return { browHeight, mouthCurve, eyeOpenness }
  }, [])

  // Analyze voice metrics
  const analyzeVoiceMetrics = useCallback(() => {
    if (!analyserRef.current) return { volume: 0, pitch: 0, energy: 0 }

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate volume (RMS)
    const volume = Math.sqrt(dataArray.reduce((sum, value) => sum + value * value, 0) / bufferLength) / 255

    // Estimate pitch (find peak frequency)
    let maxIndex = 0
    let maxValue = 0
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i]
        maxIndex = i
      }
    }
    const pitch = ((maxIndex / bufferLength) * (audioContextRef.current?.sampleRate || 44100)) / 2

    // Calculate energy (sum of all frequencies)
    const energy = dataArray.reduce((sum, value) => sum + value, 0) / (bufferLength * 255)

    return { volume, pitch: Math.min(pitch / 1000, 1), energy }
  }, [])

  // Determine emotion from metrics
  const determineEmotion = useCallback((faceMetrics: any, voiceMetrics: any) => {
    const { browHeight, mouthCurve, eyeOpenness } = faceMetrics
    const { volume, energy } = voiceMetrics

    // Simplified emotion classification
    if (mouthCurve > 0.3 && eyeOpenness > 0.6) {
      return { emotion: "Happy", confidence: Math.min(0.9, mouthCurve + eyeOpenness) }
    } else if (browHeight < 0.3 && mouthCurve < -0.2) {
      return { emotion: "Angry", confidence: Math.min(0.9, Math.abs(mouthCurve) + (1 - browHeight)) }
    } else if (browHeight > 0.7 && eyeOpenness > 0.7) {
      return { emotion: "Surprised", confidence: Math.min(0.9, browHeight + eyeOpenness) }
    } else if (volume < 0.1 && energy < 0.3) {
      return { emotion: "Calm", confidence: 0.7 }
    } else if (volume > 0.6 && energy > 0.6) {
      return { emotion: "Excited", confidence: Math.min(0.9, volume + energy) }
    } else if (mouthCurve < -0.1 && browHeight > 0.5) {
      return { emotion: "Sad", confidence: Math.min(0.8, Math.abs(mouthCurve) + browHeight) }
    } else {
      return { emotion: "Neutral", confidence: 0.6 }
    }
  }, [])

  // Main detection loop
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !isActive) return

    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current)
      const voiceMetrics = analyzeVoiceMetrics()

      if (faces.length > 0) {
        const faceMetrics = analyzeFaceEmotion(faces[0])
        const { emotion, confidence } = determineEmotion(faceMetrics, voiceMetrics)

        const emotionState: EmotionState = {
          primary: emotion,
          confidence,
          timestamp: Date.now(),
          faceMetrics,
          voiceMetrics,
        }

        setCurrentEmotion(emotionState)
      }
    } catch (err) {
      console.error("Detection error:", err)
    }

    if (isActive) {
      requestAnimationFrame(runDetection)
    }
  }, [isActive, analyzeFaceEmotion, analyzeVoiceMetrics, determineEmotion])

  // Start detection
  const startDetection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      setPermissions({ camera: true, microphone: true })

      // Initialize models
      const faceInitialized = await initializeFaceDetection()
      const audioInitialized = await initializeAudioAnalysis(stream)

      if (!faceInitialized || !audioInitialized) {
        throw new Error("Failed to initialize detection models")
      }

      setIsActive(true)

      // Start logging every 5 seconds
      intervalRef.current = setInterval(() => {
        if (currentEmotion) {
          setEmotionHistory((prev) => [...prev.slice(-19), currentEmotion])
        }
      }, 5000)

      // Start detection loop
      setTimeout(() => runDetection(), 1000)
    } catch (err) {
      console.error("Failed to start detection:", err)
      setError("Failed to access camera or microphone. Please check permissions.")
    } finally {
      setIsLoading(false)
    }
  }

  // Stop detection
  const stopDetection = () => {
    setIsActive(false)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setCurrentEmotion(null)
    setPermissions({ camera: false, microphone: false })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection()
    }
  }, [])

  const getEmotionColor = (emotion: string) => {
    const colors = {
      Happy: "text-yellow-400",
      Sad: "text-blue-400",
      Angry: "text-red-400",
      Surprised: "text-purple-400",
      Excited: "text-orange-400",
      Calm: "text-green-400",
      Neutral: "text-gray-400",
    }
    return colors[emotion as keyof typeof colors] || "text-gray-400"
  }

  const getEmotionBg = (emotion: string) => {
    const colors = {
      Happy: "bg-yellow-500/20",
      Sad: "bg-blue-500/20",
      Angry: "bg-red-500/20",
      Surprised: "bg-purple-500/20",
      Excited: "bg-orange-500/20",
      Calm: "bg-green-500/20",
      Neutral: "bg-gray-500/20",
    }
    return colors[emotion as keyof typeof colors] || "bg-gray-500/20"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Lumience Development
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real-time emotion detection using facial landmarks and voice analysis. All processing happens locally in
            your browser.
          </p>
        </div>

        {/* Privacy Notice */}
        <Alert className="bg-gray-900 border-gray-700">
          <Shield className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-gray-300">
            <strong className="text-green-400">Privacy Protected:</strong> We don't record anything. All analysis
            happens in-browser and data never leaves your device.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Feed */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                    <div className="text-center space-y-4">
                      <CameraOff className="h-12 w-12 text-gray-500 mx-auto" />
                      <p className="text-gray-400">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                {!isActive ? (
                  <Button
                    onClick={startDetection}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Detection
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={stopDetection} variant="destructive" className="flex-1">
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Detection
                  </Button>
                )}
              </div>

              {/* Permissions Status */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Camera className={`h-4 w-4 ${permissions.camera ? "text-green-400" : "text-gray-500"}`} />
                  <span className={permissions.camera ? "text-green-400" : "text-gray-500"}>
                    Camera {permissions.camera ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {permissions.microphone ? (
                    <Mic className="h-4 w-4 text-green-400" />
                  ) : (
                    <MicOff className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={permissions.microphone ? "text-green-400" : "text-gray-500"}>
                    Microphone {permissions.microphone ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Emotion */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current Emotion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentEmotion ? (
                <>
                  {/* Primary Emotion */}
                  <div className="text-center space-y-4">
                    <div
                      className={`inline-flex items-center px-6 py-3 rounded-full ${getEmotionBg(currentEmotion.primary)}`}
                    >
                      <span className={`text-2xl font-bold ${getEmotionColor(currentEmotion.primary)}`}>
                        {currentEmotion.primary}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white">{Math.round(currentEmotion.confidence * 100)}%</span>
                      </div>
                      <Progress value={currentEmotion.confidence * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-purple-400">Face Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Brow Height</span>
                          <span>{Math.round(currentEmotion.faceMetrics.browHeight * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mouth Curve</span>
                          <span>{Math.round(currentEmotion.faceMetrics.mouthCurve * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Eye Openness</span>
                          <span>{Math.round(currentEmotion.faceMetrics.eyeOpenness * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-pink-400 flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Voice Metrics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume</span>
                          <span>{Math.round(currentEmotion.voiceMetrics.volume * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pitch</span>
                          <span>{Math.round(currentEmotion.voiceMetrics.pitch * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Energy</span>
                          <span>{Math.round(currentEmotion.voiceMetrics.energy * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start detection to see real-time emotions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emotion History */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Emotion History (Last 5 seconds intervals)</CardTitle>
          </CardHeader>
          <CardContent>
            {emotionHistory.length > 0 ? (
              <div className="space-y-2">
                {emotionHistory
                  .slice(-10)
                  .reverse()
                  .map((emotion, index) => (
                    <div
                      key={emotion.timestamp}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getEmotionBg(emotion.primary)}>
                          <span className={getEmotionColor(emotion.primary)}>{emotion.primary}</span>
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {Math.round(emotion.confidence * 100)}% confidence
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(emotion.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No emotion data logged yet. Start detection to begin tracking.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-900/20 border-red-700">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
