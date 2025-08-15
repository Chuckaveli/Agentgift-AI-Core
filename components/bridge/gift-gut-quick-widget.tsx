"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Lock, Sparkles, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface GiftGutQuickProps {
  userTier: string
  demoCompleted: boolean
}

export function GiftGutQuickWidget({ userTier, demoCompleted }: GiftGutQuickProps) {
  const [giftIdea, setGiftIdea] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    score: number
    feedback: string
    sentiment: "positive" | "neutral" | "negative"
  } | null>(null)

  const isProUser = ["PRO", "PRO+", "ENTERPRISE"].includes(userTier)
  const canUseFeature = isProUser || !demoCompleted

  const analyzeGift = async () => {
    if (!giftIdea.trim() || !canUseFeature) return

    setIsAnalyzing(true)

    // Mock analysis - in real app, this would call the API
    setTimeout(() => {
      const mockResults = [
        {
          score: 85,
          feedback: "Great choice! This gift shows thoughtfulness and aligns well with their interests.",
          sentiment: "positive" as const,
        },
        {
          score: 65,
          feedback: "Good idea, but consider personalizing it more to make it extra special.",
          sentiment: "neutral" as const,
        },
        {
          score: 40,
          feedback: "This might not be the best fit. Consider their personality and preferences more.",
          sentiment: "negative" as const,
        },
      ]

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setResult(randomResult)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return ThumbsUp
      case "negative":
        return ThumbsDown
      default:
        return AlertCircle
    }
  }

  if (!canUseFeature) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Quick Gift Check</span>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Lock className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Got a gift idea? Get instant AI feedback on how well it matches your recipient.
          </p>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-purple-700 mb-2">Pro Feature</p>
            <p className="text-xs text-gray-600 mb-4">Upgrade to get instant AI feedback on your gift ideas</p>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              asChild
            >
              <Link href="/pricing">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span>Quick Gift Check</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Got a gift idea? Get instant AI feedback on how well it matches your recipient.
        </p>

        <div className="space-y-3">
          <Input
            placeholder="e.g., A vintage leather journal for my book-loving friend"
            value={giftIdea}
            onChange={(e) => setGiftIdea(e.target.value)}
            className="bg-white"
          />

          <Button
            onClick={analyzeGift}
            disabled={!giftIdea.trim() || isAnalyzing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Check This Gift
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {(() => {
                  const IconComponent = getScoreIcon(result.sentiment)
                  return <IconComponent className={`w-5 h-5 ${getScoreColor(result.score)}`} />
                })()}
                <span className={`font-bold text-lg ${getScoreColor(result.score)}`}>{result.score}/100</span>
              </div>
              <Badge
                variant="outline"
                className={
                  result.sentiment === "positive"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : result.sentiment === "negative"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }
              >
                {result.sentiment === "positive"
                  ? "Great Match"
                  : result.sentiment === "negative"
                    ? "Needs Work"
                    : "Good Potential"}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">{result.feedback}</p>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <Link href="/gut-check">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Detailed Analysis
                </Link>
              </Button>
            </div>
          </div>
        )}

        {!result && !isAnalyzing && (
          <div className="text-center py-4">
            <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Enter a gift idea above to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

