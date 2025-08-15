"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Gift,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  Crown,
  Lock,
  Zap,
  Brain,
  Star,
  ThumbsUp,
  Meh,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock user data - in real app this would come from auth/context
const userData = {
  name: "Alex Chen",
  tier: "pro", // free, premium, pro, agent00g, business, enterprise
  credits: 1250,
}

const tierHierarchy = {
  free: 0,
  premium: 1,
  pro: 2,
  agent00g: 3,
  business: 4,
  enterprise: 5,
}

interface GiftEvaluation {
  score: number
  category: "perfect" | "maybe" | "nope"
  feedback: string
  reasons: string[]
  improvements: string[]
  confidence: number
}

const mockEvaluations: Record<string, GiftEvaluation> = {
  "coffee mug": {
    score: 85,
    category: "perfect",
    feedback: "This is a thoughtful and practical gift that shows you pay attention to their daily habits!",
    reasons: [
      "Matches their coffee enthusiast personality",
      "Practical for daily use",
      "Shows thoughtfulness about their routine",
    ],
    improvements: ["Consider personalizing with their name or favorite quote", "Add premium coffee beans as a bundle"],
    confidence: 92,
  },
  "generic gift card": {
    score: 45,
    category: "maybe",
    feedback: "Gift cards are safe but might feel impersonal. Consider adding a personal touch.",
    reasons: ["Gives recipient choice and flexibility", "No risk of wrong size or preference"],
    improvements: [
      "Choose a store that matches their specific interests",
      "Include a handwritten note explaining why you chose that store",
      "Consider experiential gift cards (spa, restaurant, activities)",
    ],
    confidence: 78,
  },
  "random item": {
    score: 25,
    category: "nope",
    feedback: "This gift doesn't seem to connect with what we know about the recipient.",
    reasons: ["No clear connection to their interests", "Might end up unused or regifted"],
    improvements: [
      "Research their hobbies and interests more deeply",
      "Ask mutual friends for gift ideas",
      "Consider their lifestyle and daily needs",
      "Think about experiences rather than objects",
    ],
    confidence: 85,
  },
}

export default function GutCheckPage() {
  const [giftIdea, setGiftIdea] = useState("")
  const [recipientInfo, setRecipientInfo] = useState("")
  const [occasion, setOccasion] = useState("")
  const [budget, setBudget] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [evaluation, setEvaluation] = useState<GiftEvaluation | null>(null)
  const [showResults, setShowResults] = useState(false)

  const hasProAccess = tierHierarchy[userData.tier as keyof typeof tierHierarchy] >= tierHierarchy.pro

  const handleAnalyze = async () => {
    if (!giftIdea.trim()) return

    setIsAnalyzing(true)
    setShowResults(false)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock evaluation based on gift idea
    const lowerGift = giftIdea.toLowerCase()
    let mockEval: GiftEvaluation

    if (lowerGift.includes("coffee") || lowerGift.includes("mug") || lowerGift.includes("tea")) {
      mockEval = mockEvaluations["coffee mug"]
    } else if (lowerGift.includes("gift card") || lowerGift.includes("card")) {
      mockEval = mockEvaluations["generic gift card"]
    } else {
      mockEval = mockEvaluations["random item"]
    }

    setEvaluation(mockEval)
    setIsAnalyzing(false)
    setShowResults(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreIcon = (category: string) => {
    switch (category) {
      case "perfect":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "maybe":
        return <Meh className="w-6 h-6 text-yellow-500" />
      case "nope":
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Target className="w-6 h-6" />
    }
  }

  const getScoreEmoji = (category: string) => {
    switch (category) {
      case "perfect":
        return "🎯"
      case "maybe":
        return "🤔"
      case "nope":
        return "😬"
      default:
        return "🎁"
    }
  }

  const getCategoryBg = (category: string) => {
    switch (category) {
      case "perfect":
        return "from-green-500/20 to-emerald-500/20 border-green-500/30"
      case "maybe":
        return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
      case "nope":
        return "from-red-500/20 to-pink-500/20 border-red-500/30"
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-500/30"
    }
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
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gift Gut Check™</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered gift evaluation</p>
                </div>
              </div>
            </div>

            <Badge className="bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-600/30">
              <Crown className="w-3 h-3 mr-1" />
              Pro Feature
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {hasProAccess ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Gift Input Form */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span>Tell me about your gift idea</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gift-idea" className="text-gray-700 dark:text-gray-300">
                    What gift are you considering? *
                  </Label>
                  <Input
                    id="gift-idea"
                    placeholder="e.g., A coffee mug with their favorite quote"
                    value={giftIdea}
                    onChange={(e) => setGiftIdea(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient-info" className="text-gray-700 dark:text-gray-300">
                    Tell me about the recipient
                  </Label>
                  <Textarea
                    id="recipient-info"
                    placeholder="e.g., My best friend who loves coffee, works from home, and appreciates thoughtful gestures"
                    value={recipientInfo}
                    onChange={(e) => setRecipientInfo(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occasion" className="text-gray-700 dark:text-gray-300">
                      Occasion
                    </Label>
                    <Input
                      id="occasion"
                      placeholder="e.g., Birthday, Holiday"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-gray-700 dark:text-gray-300">
                      Budget Range
                    </Label>
                    <Input
                      id="budget"
                      placeholder="e.g., $20-50"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!giftIdea.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Gift...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Get Gut Check
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
                      <span className="text-lg font-medium text-white">AI is thinking...</span>
                    </div>
                    <Progress value={75} className="w-full" />
                    <div className="text-center text-sm text-gray-300">
                      Analyzing gift compatibility, recipient preferences, and occasion appropriateness
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {showResults && evaluation && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Score Card */}
                <Card className={`bg-gradient-to-r ${getCategoryBg(evaluation.category)} border`}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-6xl animate-bounce">{getScoreEmoji(evaluation.category)}</div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          {getScoreIcon(evaluation.category)}
                          <span className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
                            {evaluation.score}/100
                          </span>
                        </div>

                        <Badge
                          className={cn(
                            "text-lg px-4 py-1",
                            evaluation.category === "perfect" && "bg-green-500/20 text-green-600 border-green-500/30",
                            evaluation.category === "maybe" && "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                            evaluation.category === "nope" && "bg-red-500/20 text-red-600 border-red-500/30",
                          )}
                        >
                          {evaluation.category === "perfect" && "Perfect Match!"}
                          {evaluation.category === "maybe" && "Could Work"}
                          {evaluation.category === "nope" && "Think Again"}
                        </Badge>
                      </div>

                      <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md mx-auto">{evaluation.feedback}</p>

                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Zap className="w-4 h-4" />
                        <span>Confidence: {evaluation.confidence}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Tabs defaultValue="reasons" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reasons" className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Why It Works</span>
                    </TabsTrigger>
                    <TabsTrigger value="improvements" className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Make It Better</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="reasons" className="mt-4">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span>Positive Aspects</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {evaluation.reasons.map((reason, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="improvements" className="mt-4">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                          <TrendingUp className="w-5 h-5" />
                          <span>Improvement Suggestions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      setGiftIdea("")
                      setRecipientInfo("")
                      setOccasion("")
                      setBudget("")
                      setEvaluation(null)
                      setShowResults(false)
                    }}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-600"
                  >
                    Check Another Gift
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Gift className="w-4 h-4 mr-2" />
                    Find Similar Gifts
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Locked UI for Free/Premium Users */
          <div className="max-w-2xl mx-auto">
            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {/* Locked Overlay */}
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Get smarter gift feedback with deep analysis</h3>
                  <p className="text-gray-300 max-w-md">
                    Unlock advanced AI analysis, personalized recommendations, and detailed gift scoring with Pro.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    asChild
                  >
                    <Link href="/pricing">
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock with Pro
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Preview Content (Blurred) */}
              <div className="blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span>Tell me about your gift idea</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>What gift are you considering? *</Label>
                    <Input placeholder="e.g., A coffee mug with their favorite quote" disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Tell me about the recipient</Label>
                    <Textarea
                      placeholder="e.g., My best friend who loves coffee, works from home..."
                      disabled
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Occasion</Label>
                      <Input placeholder="e.g., Birthday, Holiday" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget Range</Label>
                      <Input placeholder="e.g., $20-50" disabled />
                    </div>
                  </div>

                  <Button disabled className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Get Gut Check
                  </Button>
                </CardContent>
              </div>
            </Card>

            {/* Mock Results Preview */}
            <div className="mt-6 space-y-4">
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-10" />
                <CardContent className="p-6 blur-sm">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎯</div>
                    <div className="text-3xl font-bold text-green-500">85/100</div>
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Perfect Match!</Badge>
                    <p className="text-lg">This is a thoughtful and practical gift...</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Preview of detailed analysis, scoring, and recommendations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

