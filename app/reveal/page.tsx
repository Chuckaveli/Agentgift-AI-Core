"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"

export default function RevealPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRevealed, setIsRevealed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [messageType, setMessageType] = useState<"text" | "voice" | "video">("text")

  // Mock data - in real app, this would come from URL params or API
  const revealData = {
    id: searchParams?.get("id") || "demo-123",
    senderName: "Sarah Johnson",
    senderAvatar: "/placeholder-user.jpg",
    recipientName: "Alex",
    giftName: "Cozy Winter Care Package",
    message:
      "Hey Alex! I saw you've been working so hard lately, and with winter coming up, I thought you could use some cozy vibes. This care package has all your favorites - that lavender tea you love, the softest blanket ever, and some homemade cookies from that bakery we discovered together. You deserve all the warmth and comfort! 💝",
    voiceMessage: "/mock-voice-message.mp3", // Mock URL
    videoMessage: "/mock-video-message.mp4", // Mock URL
    giftImage: "/placeholder.svg?height=300&width=300&text=Cozy+Care+Package",
    createdAt: "2024-01-15T10:30:00Z",
    occasion: "Just Because",
    theme: "cozy",
  }

  useEffect(() => {
    // Auto-reveal after 2 seconds for demo
    const timer = setTimeout(() => {
      handleReveal()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleReveal = () => {
    setIsRevealed(true)
    setShowConfetti(true)

    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In real app, control actual audio/video playback
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In real app, control actual audio muting
  }

  const shareReveal = () => {
    if (navigator.share) {
      navigator.share({
        title: `Gift from ${revealData.senderName}`,
        text: `Check out this amazing gift reveal!`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Sparkles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full opacity-70 animate-pulse ${
              isRevealed ? "animate-bounce" : ""
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "3s",
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={shareReveal} className="text-white hover:bg-white/10">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* Pre-Reveal State */}
          {!isRevealed && (
            <div className="text-center space-y-6 mt-20">
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="h-12 w-12 text-white animate-bounce" />
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">You have a gift! 🎁</h1>
                <p className="text-purple-200">From {revealData.senderName}</p>
              </div>

              <div className="flex justify-center">
                <div className="animate-bounce">
                  <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
                </div>
              </div>

              <p className="text-sm text-purple-200 animate-pulse">Preparing your surprise...</p>
            </div>
          )}

          {/* Post-Reveal State */}
          {isRevealed && (
            <div className="space-y-6 mt-8">
              {/* Sender Info */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white/30">
                      <AvatarImage src={revealData.senderAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {revealData.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="font-semibold text-white">{revealData.senderName}</h2>
                      <p className="text-sm text-purple-200">sent you a {revealData.occasion.toLowerCase()} gift</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {revealData.occasion}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Gift Image */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={revealData.giftImage || "/placeholder.svg"}
                      alt={revealData.giftName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">{revealData.giftName}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Type Selector */}
              <div className="flex gap-2 justify-center">
                {["text", "voice", "video"].map((type) => (
                  <Button
                    key={type}
                    variant={messageType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageType(type as any)}
                    className={
                      messageType === type
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                    }
                  >
                    {type === "text" && "💬"}
                    {type === "voice" && "🎵"}
                    {type === "video" && "🎥"}
                    <span className="ml-1 capitalize">{type}</span>
                  </Button>
                ))}
              </div>

              {/* Message Content */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  {/* Text Message */}
                  {messageType === "text" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-purple-200">Personal Message</span>
                      </div>
                      <p className="text-white leading-relaxed">{revealData.message}</p>
                    </div>
                  )}

                  {/* Voice Message */}
                  {messageType === "voice" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-sm text-purple-200">Voice Message</span>
                      </div>

                      {/* Audio Waveform Visualization */}
                      <div className="flex items-center gap-1 h-12 justify-center">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full ${
                              isPlaying ? "animate-pulse" : ""
                            }`}
                            style={{
                              height: `${20 + Math.random() * 30}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={togglePlayback}
                          className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>

                        <div className="flex-1 text-center">
                          <div className="text-sm text-purple-200">{isPlaying ? "Playing..." : "Tap to play"}</div>
                          <div className="text-xs text-purple-300">2:34</div>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleMute}
                          className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Video Message */}
                  {messageType === "video" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-sm text-purple-200">Video Message</span>
                      </div>

                      {/* Video Player Mock */}
                      <div className="relative bg-black/50 rounded-lg overflow-hidden aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlayback}
                            className="w-16 h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                          >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                          </Button>
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/30 rounded-full">
                              <div className="w-1/3 h-full bg-white rounded-full" />
                            </div>
                            <span className="text-xs text-white">1:23 / 3:45</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={() => {
                    // Mock reaction
                    setShowConfetti(true)
                    setTimeout(() => setShowConfetti(false), 2000)
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Send Thanks
                </Button>

                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={shareReveal}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-md mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
              <Heart className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-white font-medium">Powered by Agent Gifty™</span>
          </div>

          <Button
            variant="link"
            size="sm"
            className="text-purple-300 hover:text-white p-0 h-auto"
            onClick={() => window.open("https://agentgift.ai", "_blank")}
          >
            Send your own reveal? Try it free at AgentGift.ai
          </Button>
        </div>
      </footer>
    </div>
  )
}
