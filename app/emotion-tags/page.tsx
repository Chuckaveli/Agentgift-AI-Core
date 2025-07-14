"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Sparkles, Coffee, Laugh, Zap, Crown, Lock, TrendingUp, Gift, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock user data - in real app this would come from auth/context
const userData = {
  tier: "premium", // Change to "pro" to see full functionality
  name: "Alex Chen",
}

const emotions = [
  {
    id: "cozy",
    name: "Cozy",
    icon: Coffee,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-300",
    description: "Warm, comforting, snuggly vibes",
    trending: true,
  },
  {
    id: "funny",
    name: "Funny",
    icon: Laugh,
    color: "from-yellow-500 to-green-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    textColor: "text-yellow-700 dark:text-yellow-300",
    description: "Hilarious, quirky, laugh-out-loud",
    trending: false,
  },
  {
    id: "bold",
    name: "Bold",
    icon: Zap,
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-300",
    description: "Daring, adventurous, statement-making",
    trending: true,
  },
  {
    id: "sweet",
    name: "Sweet",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-700 dark:text-pink-300",
    description: "Romantic, thoughtful, heartwarming",
    trending: false,
  },
  {
    id: "luxe",
    name: "Luxe",
    icon: Crown,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-700 dark:text-purple-300",
    description: "Premium, elegant, sophisticated",
    trending: true,
  },
  {
    id: "magical",
    name: "Magical",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    textColor: "text-indigo-700 dark:text-indigo-300",
    description: "Enchanting, whimsical, wonder-filled",
    trending: false,
  },
]

const mockGiftSuggestions = {
  cozy: [
    {
      type: "Physical Gift",
      title: "Weighted Blanket & Tea Set",
      description: "Ultra-soft weighted blanket with artisan tea collection",
      price: "$89",
      confidence: 95,
    },
    {
      type: "Experience",
      title: "Home Spa Kit",
      description: "DIY spa experience with candles, bath bombs, and face masks",
      price: "$45",
      confidence: 88,
    },
    {
      type: "Ritual",
      title: "Sunday Morning Routine",
      description: "Curated morning ritual box with coffee, journal, and playlist",
      price: "$32",
      confidence: 92,
    },
  ],
  funny: [
    {
      type: "Physical Gift",
      title: "Quirky Desk Accessories",
      description: "Hilarious office gadgets and conversation starters",
      price: "$25",
      confidence: 87,
    },
    {
      type: "Experience",
      title: "Comedy Show Tickets",
      description: "Local stand-up comedy night for two",
      price: "$60",
      confidence: 94,
    },
    {
      type: "Ritual",
      title: "Meme Care Package",
      description: "Monthly box of trending memes and funny snacks",
      price: "$19",
      confidence: 82,
    },
  ],
  bold: [
    {
      type: "Physical Gift",
      title: "Adventure Gear Set",
      description: "Rock climbing starter kit with safety equipment",
      price: "$150",
      confidence: 91,
    },
    {
      type: "Experience",
      title: "Skydiving Session",
      description: "Tandem skydiving experience with professional instructor",
      price: "$299",
      confidence: 96,
    },
    {
      type: "Ritual",
      title: "Daily Dare Challenge",
      description: "30-day challenge cards for stepping out of comfort zone",
      price: "$15",
      confidence: 85,
    },
  ],
  sweet: [
    {
      type: "Physical Gift",
      title: "Custom Photo Album",
      description: "Handcrafted memory book with personal messages",
      price: "$65",
      confidence: 93,
    },
    {
      type: "Experience",
      title: "Couples Cooking Class",
      description: "Private cooking lesson for two with wine pairing",
      price: "$120",
      confidence: 89,
    },
    {
      type: "Ritual",
      title: "Love Notes Subscription",
      description: "Weekly personalized love notes delivered to their door",
      price: "$28",
      confidence: 91,
    },
  ],
  luxe: [
    {
      type: "Physical Gift",
      title: "Premium Skincare Set",
      description: "High-end skincare routine with gold-infused serums",
      price: "$180",
      confidence: 94,
    },
    {
      type: "Experience",
      title: "Wine Tasting Tour",
      description: "Private vineyard tour with sommelier-guided tasting",
      price: "$250",
      confidence: 92,
    },
    {
      type: "Ritual",
      title: "Monthly Luxury Box",
      description: "Curated luxury items delivered monthly",
      price: "$75",
      confidence: 88,
    },
  ],
  magical: [
    {
      type: "Physical Gift",
      title: "Crystal & Tarot Set",
      description: "Beginner-friendly crystal collection with tarot deck",
      price: "$55",
      confidence: 86,
    },
    {
      type: "Experience",
      title: "Stargazing Night",
      description: "Guided astronomy session with telescope and hot cocoa",
      price: "$40",
      confidence: 90,
    },
    {
      type: "Ritual",
      title: "Moon Phase Journal",
      description: "Guided journaling aligned with lunar cycles",
      price: "$22",
      confidence: 84,
    },
  ],
}

export default function EmotionTagsPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const hasProAccess =
    userData.tier === "pro" ||
    userData.tier === "agent00g" ||
    userData.tier === "business" ||
    userData.tier === "enterprise"

  const handleEmotionSelect = async (emotionId: string) => {
    if (!hasProAccess) return

    setSelectedEmotion(emotionId)
    setIsGenerating(true)
    setShowResults(false)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsGenerating(false)
    setShowResults(true)
  }

  const selectedEmotionData = emotions.find((e) => e.id === selectedEmotion)
  const suggestions = selectedEmotion ? mockGiftSuggestions[selectedEmotion as keyof typeof mockGiftSuggestions] : []

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
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Emotion Tag Gifting
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Match gifts to feelings</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {!hasProAccess ? (
          /* Locked Preview for Non-Pro Users */
          <div className="relative">
            {/* Blurred Background Content */}
            <div className="filter blur-sm pointer-events-none opacity-50">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Choose Your Vibe</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select an emotion to discover perfectly matched gifts
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {emotions.slice(0, 6).map((emotion) => {
                  const IconComponent = emotion.icon
                  return (
                    <Card key={emotion.id} className="cursor-pointer transition-all duration-200">
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${emotion.color} flex items-center justify-center mx-auto mb-3`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{emotion.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{emotion.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <Card className="max-w-md mx-4 bg-white dark:bg-gray-800 border-2 border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Next-Level Gift Matching</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Filter gifts by emotion? That's next-level. Upgrade to Pro to unlock AI-powered emotion-based gift
                    recommendations.
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    asChild
                  >
                    <Link href="/pricing">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Full Functionality for Pro Users */
          <>
            {/* Trending Moods Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Moods</h2>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Hot Right Now
                </Badge>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {emotions
                  .filter((e) => e.trending)
                  .map((emotion) => {
                    const IconComponent = emotion.icon
                    return (
                      <Card
                        key={emotion.id}
                        className="flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-500/20"
                        onClick={() => handleEmotionSelect(emotion.id)}
                      >
                        <CardContent className="p-3 flex items-center space-x-3 min-w-[160px]">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${emotion.color} flex items-center justify-center`}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{emotion.name}</h4>
                            <div className="flex items-center text-xs text-green-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>

            {/* All Emotions Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Choose Your Vibe</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select an emotion to discover perfectly matched gifts
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {emotions.map((emotion) => {
                  const IconComponent = emotion.icon
                  const isSelected = selectedEmotion === emotion.id

                  return (
                    <Card
                      key={emotion.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:scale-105",
                        isSelected
                          ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                          : "hover:shadow-lg",
                      )}
                      onClick={() => handleEmotionSelect(emotion.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${emotion.color} flex items-center justify-center mx-auto mb-3 ${isSelected ? "animate-pulse" : ""}`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{emotion.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{emotion.description}</p>
                        {emotion.trending && (
                          <Badge className="mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Loading State */}
            {isGenerating && selectedEmotionData && (
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedEmotionData.color} flex items-center justify-center animate-pulse`}
                    >
                      <selectedEmotionData.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Analyzing {selectedEmotionData.name} Vibes...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Our AI is matching gifts to your chosen emotion
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {showResults && selectedEmotionData && suggestions.length > 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedEmotionData.color} flex items-center justify-center mx-auto mb-4 animate-bounce`}
                  >
                    <selectedEmotionData.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Perfect {selectedEmotionData.name} Matches!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Here are 3 gift ideas that capture the {selectedEmotionData.name.toLowerCase()} vibe
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-purple-500/20"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`${selectedEmotionData.bgColor} ${selectedEmotionData.textColor} border-0`}>
                            {suggestion.type}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {suggestion.confidence}%
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{suggestion.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{suggestion.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">{suggestion.price}</span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Love these suggestions?</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Save them to your gift vault or share with friends for feedback!
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" size="sm">
                        Save All
                      </Button>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
