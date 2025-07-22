"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Gift,
  Share2,
  RefreshCw,
  Crown,
  Lock,
  Zap,
  Star,
  Volume2,
  ImageIcon,
  MessageSquare,
  Vault,
  Send,
  Calendar,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock user data - in real app this would come from auth/context
const userData = {
  name: "Alex Chen",
  tier: "pro", // free, premium, pro, agent00g, business, enterprise
  credits: 1250,
  serendipity_used_today: 0, // For free tier limitation
  vault_items: 15,
}

const tierHierarchy = {
  free: 0,
  premium: 1,
  pro: 2,
  agent00g: 3,
  business: 4,
  enterprise: 5,
}

interface SerendipityState {
  userId: string
  occasionType: string
  emotionalState: string
  recentLifeEvent: string
  giftFrequency: string
  userTier: string
  preferredFormat: string
}

interface GiftRevelation {
  giftName: string
  reasoning: string
  emotionalBenefit: string
  giftUrl: string
  price: string
  category: string
  confidence: number
}

interface Affirmation {
  text: string
  icon: string
}

const occasionTypes = [
  "Just Because",
  "Healing",
  "Milestone",
  "Anniversary",
  "Celebration",
  "Comfort",
  "New Beginning",
  "Self-Love",
  "Gratitude",
  "Apology",
]

const emotionalStates = [
  "Overwhelmed",
  "Grateful",
  "Nostalgic",
  "Excited",
  "Uncertain",
  "Peaceful",
  "Anxious",
  "Hopeful",
  "Reflective",
  "Joyful",
  "Lost",
  "Empowered",
]

const lifeEvents = [
  "",
  "Breakup",
  "New Job",
  "Burnout",
  "Moving",
  "Graduation",
  "Loss",
  "Recovery",
  "Achievement",
  "Travel",
  "Relationship",
  "Health Journey",
]

const giftFrequencies = ["Rare", "Occasional", "Frequent", "Constant"]

const formatOptions = [
  { value: "text", label: "Text Reveal", icon: MessageSquare },
  { value: "audio", label: "Audio Message", icon: Volume2 },
  { value: "image", label: "Image + Caption", icon: ImageIcon },
]

// Mock gift database for different emotional states and occasions
const giftDatabase = {
  "overwhelmed-healing": {
    giftName: "Weighted Aromatherapy Hoodie",
    reasoning: "Comfort that hugs like a friend, smells like calm.",
    emotionalBenefit: "Emotional regulation, sensory calm",
    giftUrl: "/products/weighted-aromatherapy-hoodie",
    price: "$89.99",
    category: "Self-Care",
    confidence: 94,
  },
  "nostalgic-anniversary": {
    giftName: "Memory Constellation Lamp",
    reasoning: "Projects your shared moments into stars on the ceiling.",
    emotionalBenefit: "Connection to cherished memories",
    giftUrl: "/products/memory-constellation-lamp",
    price: "$124.99",
    category: "Sentimental",
    confidence: 91,
  },
  "anxious-justbecause": {
    giftName: "Worry Stone Garden Kit",
    reasoning: "Smooth stones for nervous hands, tiny plants for hope.",
    emotionalBenefit: "Grounding, mindful distraction",
    giftUrl: "/products/worry-stone-garden",
    price: "$34.99",
    category: "Mindfulness",
    confidence: 88,
  },
  "excited-milestone": {
    giftName: "Achievement Echo Journal",
    reasoning: "Records your voice celebrating wins, plays them back on hard days.",
    emotionalBenefit: "Self-celebration, confidence building",
    giftUrl: "/products/achievement-echo-journal",
    price: "$67.99",
    category: "Personal Growth",
    confidence: 92,
  },
  default: {
    giftName: "Serendipity Box",
    reasoning: "A curated surprise that matches your current energy.",
    emotionalBenefit: "Unexpected joy, self-discovery",
    giftUrl: "/products/serendipity-box",
    price: "$49.99",
    category: "Mystery",
    confidence: 85,
  },
}

const generateAffirmations = (emotionalState: string, occasionType: string): Affirmation[] => {
  const affirmationSets = {
    "overwhelmed-healing": [
      { text: "You're not too much—you're just finally feeling it all.", icon: "💝" },
      { text: "Some gifts don't need wrapping, just timing.", icon: "⏰" },
      { text: "Today is yours to reclaim.", icon: "🌟" },
    ],
    "nostalgic-anniversary": [
      { text: "The past is a gift you give to your future self.", icon: "🎁" },
      { text: "Memories are the only things that get better with time.", icon: "✨" },
      { text: "You've built something beautiful worth celebrating.", icon: "🏆" },
    ],
    "anxious-justbecause": [
      { text: "Your nervous system deserves kindness today.", icon: "🤗" },
      { text: "Small comforts can carry you through big storms.", icon: "☔" },
      { text: "You're allowed to need what you need.", icon: "💚" },
    ],
    default: [
      { text: "You deserve surprises that feel like coming home.", icon: "🏠" },
      { text: "The best gifts find you when you're not looking.", icon: "🔍" },
      { text: "Your intuition led you here for a reason.", icon: "🧭" },
    ],
  }

  const key = `${emotionalState.toLowerCase()}-${occasionType.toLowerCase().replace(" ", "")}`
  return affirmationSets[key as keyof typeof affirmationSets] || affirmationSets.default
}

const getGiftSuggestion = (state: SerendipityState): GiftRevelation => {
  const key = `${state.emotionalState.toLowerCase()}-${state.occasionType.toLowerCase().replace(" ", "")}`
  return giftDatabase[key as keyof typeof giftDatabase] || giftDatabase.default
}

export default function SerendipityPage() {
  const [currentStep, setCurrentStep] = useState<"input" | "calibration" | "revelation" | "complete">("input")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [giftRevelation, setGiftRevelation] = useState<GiftRevelation | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [currentAffirmation, setCurrentAffirmation] = useState(0)

  const [formData, setFormData] = useState<SerendipityState>({
    userId: "user_123",
    occasionType: "",
    emotionalState: "",
    recentLifeEvent: "",
    giftFrequency: "",
    userTier: userData.tier,
    preferredFormat: "text",
  })

  const hasProAccess = tierHierarchy[userData.tier as keyof typeof tierHierarchy] >= tierHierarchy.pro
  const hasPremiumAccess = tierHierarchy[userData.tier as keyof typeof tierHierarchy] >= tierHierarchy.premium
  const canUseToday = userData.tier !== "free" || userData.serendipity_used_today === 0

  const handleStartRevelation = async () => {
    if (!canUseToday) {
      setShowUpgradeModal(true)
      return
    }

    if (!formData.occasionType || !formData.emotionalState) {
      toast.error("Please fill in your occasion and emotional state")
      return
    }

    setIsProcessing(true)
    setCurrentStep("calibration")

    // Generate affirmations
    const newAffirmations = generateAffirmations(formData.emotionalState, formData.occasionType)
    setAffirmations(newAffirmations)

    // Show affirmations sequence
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setCurrentAffirmation(0)

    for (let i = 0; i < newAffirmations.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      if (i < newAffirmations.length - 1) {
        setCurrentAffirmation(i + 1)
      }
    }

    // Generate gift suggestion
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const suggestion = getGiftSuggestion(formData)
    setGiftRevelation(suggestion)

    setCurrentStep("revelation")
    setIsProcessing(false)

    // Award XP for pro users
    if (hasProAccess) {
      toast.success("+2 XP earned for gift revelation!", {
        icon: <Zap className="w-4 h-4 text-yellow-500" />,
        duration: 3000,
      })
    }
  }

  const handleSaveToVault = async () => {
    if (!giftRevelation) return

    setIsSaved(true)
    toast.success("Saved to your Gift Vault!", {
      description: "Access it anytime from your dashboard",
      duration: 3000,
    })

    if (hasProAccess) {
      toast.success("+5 XP bonus for saving!", {
        icon: <Star className="w-4 h-4 text-purple-500" />,
        duration: 2000,
      })
    }
  }

  const handleSendToFriend = async () => {
    if (!giftRevelation) return

    toast.success("Gift suggestion sent!", {
      description: "Your friend will receive this surprise revelation",
      duration: 3000,
    })

    if (hasProAccess) {
      toast.success("+5 XP bonus for sharing!", {
        icon: <Heart className="w-4 h-4 text-pink-500" />,
        duration: 2000,
      })

      // Award Soul-Gifter badge
      setTimeout(() => {
        toast.success("Badge Unlocked: Soul-Gifter!", {
          description: "You've shared emotional gifts with others",
          duration: 4000,
        })
      }, 1000)
    }
  }

  const handleRevealAnother = () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true)
      return
    }

    // Reset for another revelation
    setCurrentStep("input")
    setGiftRevelation(null)
    setIsSaved(false)
    setCurrentAffirmation(0)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 80) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">No One Knows I Needed This™</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SerendipityCircuit • Solo Revelation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {userData.tier === "free" && (
                <Badge variant="outline" className="text-gray-600 border-gray-300">
                  {userData.serendipity_used_today}/1 Today
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-600 dark:text-purple-400 border-purple-600/30">
                <Heart className="w-3 h-3 mr-1" />
                Emotional Discovery
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto">
          {currentStep === "input" && (
            <div className="space-y-6">
              {/* Introduction */}
              <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ready for a Surprise?</h2>
                  <p className="text-gray-300">
                    I'll analyze your emotional landscape to reveal the one gift you didn't know you needed—but
                    absolutely do.
                  </p>
                </CardContent>
              </Card>

              {/* Input Form */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span>Tell me about this moment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="occasion" className="text-gray-700 dark:text-gray-300">
                        What's the occasion? *
                      </Label>
                      <Select
                        value={formData.occasionType}
                        onValueChange={(value) => setFormData({ ...formData, occasionType: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Choose an occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasionTypes.map((occasion) => (
                            <SelectItem key={occasion} value={occasion}>
                              {occasion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emotional-state" className="text-gray-700 dark:text-gray-300">
                        How are you feeling? *
                      </Label>
                      <Select
                        value={formData.emotionalState}
                        onValueChange={(value) => setFormData({ ...formData, emotionalState: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Your emotional state" />
                        </SelectTrigger>
                        <SelectContent>
                          {emotionalStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="life-event" className="text-gray-700 dark:text-gray-300">
                      Any recent life events?
                    </Label>
                    <Select
                      value={formData.recentLifeEvent}
                      onValueChange={(value) => setFormData({ ...formData, recentLifeEvent: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Optional - recent changes" />
                      </SelectTrigger>
                      <SelectContent>
                        {lifeEvents.map((event) => (
                          <SelectItem key={event || "none"} value={event}>
                            {event || "None"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency" className="text-gray-700 dark:text-gray-300">
                        How often do you give gifts?
                      </Label>
                      <Select
                        value={formData.giftFrequency}
                        onValueChange={(value) => setFormData({ ...formData, giftFrequency: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Gift frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {giftFrequencies.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="format" className="text-gray-700 dark:text-gray-300">
                        Preferred reveal format
                      </Label>
                      <Select
                        value={formData.preferredFormat}
                        onValueChange={(value) => setFormData({ ...formData, preferredFormat: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <option.icon className="w-4 h-4" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartRevelation}
                    disabled={!formData.occasionType || !formData.emotionalState || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Calibrating Your Energy...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Reveal My Surprise
                      </>
                    )}
                  </Button>

                  {userData.tier === "free" && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You only get one surprise for free—your intuition will thank you later.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "calibration" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/50">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="text-2xl text-white mb-4">🌱</div>
                    <h3 className="text-xl font-semibold text-white mb-4">Emotional Calibration</h3>

                    {affirmations.length > 0 && (
                      <div className="space-y-4 animate-in fade-in duration-1000">
                        <div className="text-6xl animate-bounce">{affirmations[currentAffirmation]?.icon}</div>
                        <p className="text-lg text-gray-200 italic max-w-md mx-auto leading-relaxed">
                          "{affirmations[currentAffirmation]?.text}"
                        </p>
                      </div>
                    )}

                    <Progress value={(currentAffirmation + 1) * 33.33} className="w-full max-w-md mx-auto" />
                    <p className="text-sm text-gray-300">Reading your emotional landscape...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "revelation" && giftRevelation && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Gift Revelation */}
              <Card className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="text-6xl animate-bounce">🎁</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Your Surprise Revealed</h3>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                      <h4 className="text-xl font-bold text-emerald-400">{giftRevelation.giftName}</h4>

                      <div className="space-y-3 text-left">
                        <div className="flex items-start space-x-3">
                          <span className="text-yellow-400 font-semibold">🧠 Why:</span>
                          <span className="text-gray-200">{giftRevelation.reasoning}</span>
                        </div>

                        <div className="flex items-start space-x-3">
                          <span className="text-pink-400 font-semibold">🪞 Benefit:</span>
                          <span className="text-gray-200">{giftRevelation.emotionalBenefit}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                            {giftRevelation.category}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Confidence:</span>
                            <span className={cn("font-semibold", getConfidenceColor(giftRevelation.confidence))}>
                              {giftRevelation.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          <Link href={giftRevelation.giftUrl}>
                            <Gift className="w-4 h-4 mr-2" />
                            View Gift - {giftRevelation.price}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interaction Options */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>What's next?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={handleSaveToVault}
                      disabled={isSaved}
                      variant="outline"
                      className="flex items-center justify-center space-x-2 h-12 bg-transparent"
                    >
                      {isSaved ? <CheckCircle className="w-4 h-4" /> : <Vault className="w-4 h-4" />}
                      <span>{isSaved ? "Saved to Vault" : "Save to Vault"}</span>
                      {hasProAccess && !isSaved && <Badge className="ml-1 text-xs">+5 XP</Badge>}
                    </Button>

                    <Button
                      onClick={handleSendToFriend}
                      variant="outline"
                      className="flex items-center justify-center space-x-2 h-12 bg-transparent"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send to Friend</span>
                      {hasProAccess && <Badge className="ml-1 text-xs">+5 XP</Badge>}
                    </Button>

                    <Button
                      onClick={handleRevealAnother}
                      disabled={!hasProAccess && userData.tier === "free"}
                      className="flex items-center justify-center space-x-2 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reveal Another</span>
                      {!hasProAccess && <Lock className="w-4 h-4 ml-1" />}
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center justify-center space-x-2 h-12 bg-transparent"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Use in Ritual</span>
                    </Button>
                  </div>

                  {hasPremiumAccess && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-gold-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Premium Echo Gifts</span>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Discover theme-linked follow-up suggestions based on this revelation.
                      </p>
                      <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Explore Echoes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reflection Caption */}
              <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Your Reflection Caption</h4>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      "Today I discovered that {formData.emotionalState.toLowerCase()} doesn't need fixing—it needs{" "}
                      {giftRevelation.giftName.toLowerCase()}. Sometimes the universe knows exactly what we need before
                      we do. ✨"
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-2 bg-transparent"
                      onClick={() => {
                        toast.success("Caption copied to clipboard!")
                      }}
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share Reflection</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Unlock More Revelations
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {userData.tier === "free" && userData.serendipity_used_today > 0 && (
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Lock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Daily Limit Reached</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Free users get one revelation per day. Your intuition will thank you for the pause.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Pro Agent Benefits</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1">
                  <li>• Multiple revelations per day</li>
                  <li>• XP rewards for each discovery</li>
                  <li>• Echo gift suggestions</li>
                  <li>• Advanced emotional analysis</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-r from-gold-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Premium Features</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• Unlimited daily revelations</li>
                  <li>• Theme-linked echo suggestions</li>
                  <li>• Audio message format</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Link>
              </Button>

              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
