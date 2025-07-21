"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Heart,
  Gift,
  Lightbulb,
  Share2,
  Save,
  RefreshCw,
  Crown,
  Lock,
  Zap,
  MonitorIcon as Mirror,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { FEATURES, TIERS } from "@/lib/feature-access"

interface SerendipitySession {
  id: string
  user_id: string
  occasion_type: string
  emotional_state: string
  recent_life_event?: string
  gift_frequency: string
  preferred_format: string
  affirmations: string[]
  gift_suggestion?: {
    name: string
    why_fits: string
    emotional_benefit: string
    gift_url: string
    reflection_caption: string
  }
  xp_earned: number
  is_saved: boolean
  is_shared: boolean
  created_at: string
}

const OCCASION_TYPES = [
  "Just Because",
  "Healing",
  "Milestone",
  "Anniversary",
  "Self-Care",
  "Celebration",
  "Comfort",
  "New Beginning",
]

const LIFE_EVENTS = [
  "Breakup",
  "New Job",
  "Burnout",
  "Moving",
  "Loss",
  "Achievement",
  "Health Challenge",
  "Career Change",
]

const GIFT_FREQUENCIES = ["Rare", "Occasional", "Frequent", "Never"]

const FORMAT_OPTIONS = ["Text Reveal", "Audio Message", "Image + Caption"]

export default function SerendipityCircuitPage() {
  const [currentStep, setCurrentStep] = useState<"input" | "calibration" | "revelation" | "complete">("input")
  const [session, setSession] = useState<SerendipitySession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUsedFreeReveal, setHasUsedFreeReveal] = useState(false)

  // Form inputs
  const [occasionType, setOccasionType] = useState("Just Because")
  const [emotionalState, setEmotionalState] = useState("")
  const [recentLifeEvent, setRecentLifeEvent] = useState("")
  const [giftFrequency, setGiftFrequency] = useState("Rare")
  const [preferredFormat, setPreferredFormat] = useState("Text Reveal")

  const { hasAccess, userTier, canTrial } = useFeatureAccess(FEATURES.SENTIMENT_ANALYSIS)

  useEffect(() => {
    checkFreeUsage()
  }, [])

  const checkFreeUsage = async () => {
    try {
      const response = await fetch("/api/serendipity-circuit/usage")
      const data = await response.json()
      setHasUsedFreeReveal(data.hasUsedFreeReveal)
    } catch (error) {
      console.error("Error checking usage:", error)
    }
  }

  const startSerendipitySession = async () => {
    if (!occasionType || !emotionalState || !giftFrequency) {
      setError("Please fill in all required fields")
      return
    }

    // Check tier restrictions
    if (userTier === TIERS.FREE_AGENT && hasUsedFreeReveal) {
      setError("Free users get one surprise reveal. Upgrade to Pro for unlimited discoveries!")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/serendipity-circuit/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion_type: occasionType,
          emotional_state: emotionalState,
          recent_life_event: recentLifeEvent,
          gift_frequency: giftFrequency,
          preferred_format: preferredFormat,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start session")
      }

      const sessionData = await response.json()
      setSession(sessionData)
      setCurrentStep("calibration")

      // Auto-progress to revelation after showing affirmations
      setTimeout(() => {
        setCurrentStep("revelation")
      }, 4000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const revealAnother = async () => {
    if (userTier === TIERS.FREE_AGENT) {
      setError("Upgrade to Pro to reveal multiple surprises!")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/serendipity-circuit/reveal-another", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session?.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to reveal another gift")
      }

      const newReveal = await response.json()
      setSession((prev) => (prev ? { ...prev, gift_suggestion: newReveal.gift_suggestion } : null))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reveal another gift")
    } finally {
      setIsLoading(false)
    }
  }

  const saveToVault = async () => {
    if (!session) return

    try {
      await fetch("/api/serendipity-circuit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      })

      setSession((prev) => (prev ? { ...prev, is_saved: true } : null))
    } catch (error) {
      console.error("Error saving to vault:", error)
    }
  }

  const shareReveal = async () => {
    if (!session?.gift_suggestion) return

    try {
      await navigator.share({
        title: "My Serendipity Gift Reveal",
        text: session.gift_suggestion.reflection_caption,
        url: window.location.href,
      })

      await fetch("/api/serendipity-circuit/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      })

      setSession((prev) => (prev ? { ...prev, is_shared: true } : null))
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const resetSession = () => {
    setCurrentStep("input")
    setSession(null)
    setError(null)
    setOccasionType("Just Because")
    setEmotionalState("")
    setRecentLifeEvent("")
    setGiftFrequency("Rare")
    setPreferredFormat("Text Reveal")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SerendipityCircuit
            </h1>
            <Sparkles className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No One Knows I Needed This™</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the one gift you didn't know you needed—but absolutely do. Through emotional discovery and
            nostalgic recall, find unexpected joy.
          </p>
        </div>

        {/* Tier Status */}
        <div className="flex justify-center mb-6">
          <Badge variant={userTier === TIERS.FREE_AGENT ? "secondary" : "default"} className="px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            {userTier === TIERS.FREE_AGENT ? "Free Agent" : userTier === TIERS.PRO_AGENT ? "Pro Agent" : "Premium"}
            {userTier === TIERS.FREE_AGENT && (
              <span className="ml-2 text-xs">{hasUsedFreeReveal ? "Used" : "1 Free Reveal"}</span>
            )}
          </Badge>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Step */}
        {currentStep === "input" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Emotional Calibration Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="occasion">Occasion Type *</Label>
                <Select value={occasionType} onValueChange={setOccasionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's the occasion?" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="emotional-state">How are you feeling? *</Label>
                <Textarea
                  id="emotional-state"
                  placeholder="Describe your current emotional state..."
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="life-event">Recent Life Event (Optional)</Label>
                <Select value={recentLifeEvent} onValueChange={setRecentLifeEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any major life changes?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {LIFE_EVENTS.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gift-frequency">Gift Frequency *</Label>
                <Select value={giftFrequency} onValueChange={setGiftFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="How often do you give/receive gifts?" />
                  </SelectTrigger>
                  <SelectContent>
                    {GIFT_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Preferred Format</Label>
                <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startSerendipitySession}
                disabled={isLoading || !occasionType || !emotionalState || !giftFrequency}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Calibrating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Begin Serendipity Journey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Calibration Step */}
        {currentStep === "calibration" && session && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Emotional Calibration Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {session.affirmations.map((affirmation, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg bg-gradient-to-r text-white text-center font-medium",
                      index === 0 && "from-purple-500 to-purple-600",
                      index === 1 && "from-pink-500 to-pink-600",
                      index === 2 && "from-orange-500 to-orange-600",
                    )}
                    style={{
                      animationDelay: `${index * 1000}ms`,
                      animation: "fadeInUp 0.8s ease-out forwards",
                    }}
                  >
                    "{affirmation}"
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <div className="animate-pulse">
                  <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Preparing your perfect surprise...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revelation Step */}
        {currentStep === "revelation" && session?.gift_suggestion && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Your Serendipity Reveal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gift Suggestion */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="mb-4">
                  <Gift className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{session.gift_suggestion.name}</h3>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Why This Fits:</p>
                      <p className="text-gray-600 dark:text-gray-400">{session.gift_suggestion.why_fits}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mirror className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Emotional Benefit Unlocked:</p>
                      <p className="text-gray-600 dark:text-gray-400">{session.gift_suggestion.emotional_benefit}</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.open(session.gift_suggestion?.gift_url, "_blank")}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Get This Gift
                </Button>
              </div>

              {/* Reflection Caption */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{session.gift_suggestion.reflection_caption}"
                </p>
              </div>

              {/* XP Earned */}
              <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  +{session.xp_earned} XP Earned!
                </span>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={saveToVault}
                  disabled={session.is_saved}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="w-4 h-4" />
                  {session.is_saved ? "Saved!" : "Save to Vault"}
                </Button>

                <Button variant="outline" onClick={shareReveal} className="flex items-center gap-2 bg-transparent">
                  <Share2 className="w-4 h-4" />
                  Share Reveal
                </Button>
              </div>

              {/* Tier-based Options */}
              <div className="space-y-3">
                {userTier !== TIERS.FREE_AGENT ? (
                  <Button
                    onClick={revealAnother}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Reveal Another (+2 XP)
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                    onClick={() => window.open("/pricing", "_blank")}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Upgrade to Pro for More Reveals
                  </Button>
                )}

                <Button variant="ghost" onClick={resetSession} className="w-full">
                  Start New Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Free User Reminder */}
        {userTier === TIERS.FREE_AGENT && (
          <div className="mt-8 text-center">
            <Card className="max-w-md mx-auto border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <CardContent className="p-4">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Free Agent Reminder:</strong> You only get one surprise for free—your intuition will thank you
                  later.
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.open("/pricing", "_blank")}
                >
                  Upgrade for Unlimited Reveals
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
