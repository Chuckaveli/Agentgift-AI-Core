"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, ThumbsUp, ThumbsDown, Sparkles, ArrowRight, RotateCcw } from "lucide-react"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface GiftGutCheckProps {
  userTier: UserTier
}

const gutCheckQuestions = [
  {
    id: 1,
    question: "Does this gift feel personal and thoughtful?",
    weight: 0.3,
  },
  {
    id: 2,
    question: "Would you be excited to receive this yourself?",
    weight: 0.25,
  },
  {
    id: 3,
    question: "Does it match their personality and interests?",
    weight: 0.25,
  },
  {
    id: 4,
    question: "Is it appropriate for your relationship level?",
    weight: 0.2,
  },
]

export function GiftGutCheck({ userTier }: GiftGutCheckProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [showResults, setShowResults] = useState(false)
  const [giftDescription, setGiftDescription] = useState("")

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [gutCheckQuestions[currentQuestion].id]: answer }
    setAnswers(newAnswers)

    if (currentQuestion < gutCheckQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    gutCheckQuestions.forEach((question) => {
      if (answers[question.id]) {
        totalScore += question.weight
      }
    })
    return Math.round(totalScore * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "🎯 Perfect Choice! This gift has strong gut-check approval."
    if (score >= 60) return "👍 Good Choice! This gift passes the gut check with some reservations."
    return "🤔 Think Again! Your gut is telling you to reconsider this gift."
  }

  const resetCheck = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setGiftDescription("")
  }

  return (
    <UserTierGate userTier={userTier} requiredTier={TIERS.PREMIUM_SPY} featureName="Gift Gut Check">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gift Gut Check™</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Trust your instincts. Let's validate your gift choice with AI-powered gut feeling analysis.
          </p>
        </div>

        {!showResults ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestion + 1} of {gutCheckQuestions.length}
                </CardTitle>
                <Badge variant="outline">{Math.round(((currentQuestion + 1) / gutCheckQuestions.length) * 100)}%</Badge>
              </div>
              <Progress value={((currentQuestion + 1) / gutCheckQuestions.length) * 100} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {gutCheckQuestions[currentQuestion].question}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Think about the gift you have in mind and answer honestly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  onClick={() => handleAnswer(true)}
                  className="h-20 bg-green-600 hover:bg-green-700 text-white flex flex-col gap-2"
                >
                  <ThumbsUp className="w-6 h-6" />
                  <span>Yes</span>
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleAnswer(false)}
                  className="h-20 bg-red-600 hover:bg-red-700 text-white flex flex-col gap-2"
                >
                  <ThumbsDown className="w-6 h-6" />
                  <span>No</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Gut Check Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(calculateScore())}`}>{calculateScore()}%</div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{getScoreMessage(calculateScore())}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Breakdown:</h3>
                {gutCheckQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{question.question}</span>
                    <div className="flex items-center gap-2">
                      {answers[question.id] ? (
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-500">{Math.round(question.weight * 100)}% weight</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={resetCheck} variant="outline" className="flex-1 bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Check Another Gift
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Find Better Options
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserTierGate>
  )
}
