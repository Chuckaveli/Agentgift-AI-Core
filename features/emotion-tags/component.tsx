"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Sparkles, Coffee, Laugh, Zap, Crown, Lock, TrendingUp, Gift, Star } from "lucide-react"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface EmotionTagsProps {
  userTier: UserTier
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
      title: "Custom Meme Calendar",
      description: "Personalized calendar with inside jokes and funny memories",
      price: "$25",
      confidence: 98,
    },
    {
      type: "Experience",
      title: "Comedy Club Night",
      description: "Tickets to local comedy show with dinner",
      price: "$75",
      confidence: 85,
    },
    {
      type: "Ritual",
      title: "Weekly Game Night",
      description: "Board game collection with snacks and drinks",
      price: "$60",
      confidence: 90,
    },
  ],
  bold: [
    {
      type: "Physical Gift",
      title: "Adventure Gear Set",
      description: "High-quality hiking backpack with essential gear",
      price: "$150",
      confidence: 92,
    },
    {
      type: "Experience",
      title: "Skydiving Experience",
      description: "Tandem skydiving with professional instructor",
      price: "$200",
      confidence: 88,
    },
    {
      type: "Ritual",
      title: "Monthly Challenge Box",
      description: "Curated challenges to push comfort zones",
      price: "$40",
      confidence: 95,
    },
  ],
}

export function EmotionTags({ userTier }: EmotionTagsProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleEmotionSelect = async (emotionId: string) => {
    setSelectedEmotion(emotionId)
    setShowSuggestions(true)
  }

  return (
    <UserTierGate userTier={userTier} requiredTier={TIERS.PREMIUM_SPY} featureName="Emotion Tags">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <a href="/dashboard">
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Emotion Tags™</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Discover gifts by emotional vibe</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {!showSuggestions ? (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    What emotion are you gifting?
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Choose the emotional vibe you want to convey, and we'll find the perfect gifts that match that feeling.
                  </p>
                </div>

                {/* Emotion Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {emotions.map((emotion) => {
                    const IconComponent = emotion.icon
                    return (
                      <Card
                        key={emotion.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          emotion.trending ? "ring-2 ring-purple-200 dark:ring-purple-800" : ""
                        }`}
                        onClick={() => handleEmotionSelect(emotion.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`w-16 h-16 bg-gradient-to-r ${emotion.color} rounded-full flex items-center justify-center`}
                            >
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            {emotion.trending && (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{emotion.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{emotion.description}</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${emotion.bgColor} ${emotion.textColor}`}>
                            <Star className="w-4 h-4 mr-1" />
                            Perfect Match
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* How It Works */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">How Emotion Tags Work</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Emotion</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Pick the emotional vibe you want to convey with your gift
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Get Matches</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Receive curated gift suggestions that match that emotion
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Perfect Gift</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Choose the perfect gift that conveys exactly what you feel
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedEmotion(null)
                    setShowSuggestions(false)
                  }}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Emotions
                </Button>

                {/* Selected Emotion Header */}
                {selectedEmotion && (
                  <div className="text-center space-y-4">
                    {(() => {
                      const emotion = emotions.find((e) => e.id === selectedEmotion)
                      if (!emotion) return null
                      const IconComponent = emotion.icon
                      return (
                        <>
                          <div className={`w-20 h-20 bg-gradient-to-r ${emotion.color} rounded-full flex items-center justify-center mx-auto`}>
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{emotion.name} Gifts</h2>
                          <p className="text-lg text-gray-600 dark:text-gray-400">{emotion.description}</p>
                        </>
                      )
                    })()}
                  </div>
                )}

                {/* Gift Suggestions */}
                {selectedEmotion && mockGiftSuggestions[selectedEmotion as keyof typeof mockGiftSuggestions] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockGiftSuggestions[selectedEmotion as keyof typeof mockGiftSuggestions].map((suggestion, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary">{suggestion.type}</Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{suggestion.confidence}%</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{suggestion.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{suggestion.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600">{suggestion.price}</span>
                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                              <Gift className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get More Suggestions
                  </Button>
                  <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600 bg-transparent">
                    <Heart className="w-5 h-5 mr-2" />
                    Save to Wishlist
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserTierGate>
  )
} 