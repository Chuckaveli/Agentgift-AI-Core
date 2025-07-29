"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Sparkles, Trophy, Brain, Star, Gift } from "lucide-react"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface GiftDNAQuizProps {
  userTier: UserTier
}

// Quiz questions
const quizQuestions = [
  {
    id: 1,
    question: "When choosing a gift, what matters most to you?",
    options: [
      { id: "a", text: "The emotional impact it will have", points: { thoughtful: 3, emotional: 3 } },
      { id: "b", text: "How unique and surprising it is", points: { creative: 3, spontaneous: 2 } },
      { id: "c", text: "The practical value it provides", points: { practical: 3, reliable: 2 } },
      { id: "d", text: "How impressive it looks to others", points: { showoff: 3, competitive: 2 } },
    ],
  },
  {
    id: 2,
    question: "Your ideal gift-giving budget is:",
    options: [
      { id: "a", text: "Whatever it takes for the perfect gift", points: { generous: 3, emotional: 2 } },
      { id: "b", text: "Reasonable but allows for splurges", points: { balanced: 3, thoughtful: 1 } },
      { id: "c", text: "Carefully planned and budgeted", points: { practical: 3, reliable: 2 } },
      { id: "d", text: "Go big or go home!", points: { showoff: 3, competitive: 3 } },
    ],
  },
  {
    id: 3,
    question: "How far in advance do you usually plan gifts?",
    options: [
      { id: "a", text: "Months ahead - I love the anticipation", points: { thoughtful: 3, reliable: 2 } },
      { id: "b", text: "A few weeks - enough time to find something special", points: { balanced: 2, practical: 1 } },
      { id: "c", text: "Last minute - I work best under pressure", points: { spontaneous: 3, creative: 1 } },
      { id: "d", text: "I keep a running list all year", points: { organized: 3, thoughtful: 2 } },
    ],
  },
  {
    id: 4,
    question: "What's your reaction when someone loves your gift?",
    options: [
      { id: "a", text: "Pure joy - their happiness is everything", points: { emotional: 3, generous: 2 } },
      { id: "b", text: "Satisfied - mission accomplished", points: { reliable: 2, practical: 1 } },
      { id: "c", text: "Proud - I nailed it again", points: { competitive: 2, showoff: 1 } },
      { id: "d", text: "Already planning the next surprise", points: { creative: 3, spontaneous: 2 } },
    ],
  },
  {
    id: 5,
    question: "Your gift-wrapping style is:",
    options: [
      { id: "a", text: "Pinterest-perfect with custom touches", points: { creative: 3, thoughtful: 2 } },
      { id: "b", text: "Clean and elegant presentation", points: { balanced: 2, reliable: 1 } },
      { id: "c", text: "Quick and functional - it's what's inside that counts", points: { practical: 3 } },
      { id: "d", text: "Over-the-top spectacular", points: { showoff: 3, competitive: 2 } },
    ],
  },
  {
    id: 6,
    question: "When gift shopping, you:",
    options: [
      { id: "a", text: "Research extensively and read every review", points: { thoughtful: 3, reliable: 2 } },
      { id: "b", text: "Trust your instincts and go with your gut", points: { spontaneous: 3, emotional: 1 } },
      { id: "c", text: "Compare prices and look for the best deals", points: { practical: 3, organized: 1 } },
      { id: "d", text: "Ask friends for recommendations", points: { balanced: 2, social: 2 } },
    ],
  },
  {
    id: 7,
    question: "Your dream gift to receive would be:",
    options: [
      { id: "a", text: "Something deeply personal and meaningful", points: { emotional: 3, thoughtful: 2 } },
      { id: "b", text: "A complete surprise I never saw coming", points: { creative: 3, spontaneous: 2 } },
      { id: "c", text: "Something I actually need and will use", points: { practical: 3, reliable: 1 } },
      { id: "d", text: "Something that makes me feel special and valued", points: { generous: 2, emotional: 2 } },
    ],
  },
]

// Gifting personality types
const giftingPersonalities = {
  thoughtful: {
    name: "The Thoughtful Curator",
    emoji: "🎨",
    description: "You're the master of meaningful gifts that show deep understanding of the recipient.",
    traits: ["Deeply empathetic", "Detail-oriented", "Emotionally intelligent", "Patient planner"],
    color: "from-blue-500 to-cyan-500",
    percentage: 0,
  },
  emotional: {
    name: "The Heart-Centered Giver",
    emoji: "💝",
    description: "Your gifts create emotional connections and lasting memories.",
    traits: ["Emotionally intuitive", "Relationship-focused", "Memory maker", "Sentimental"],
    color: "from-pink-500 to-rose-500",
    percentage: 0,
  },
  creative: {
    name: "The Creative Innovator",
    emoji: "✨",
    description: "You surprise and delight with unique, imaginative gifts no one else would think of.",
    traits: ["Highly creative", "Original thinker", "Trend setter", "Artistic vision"],
    color: "from-purple-500 to-violet-500",
    percentage: 0,
  },
  practical: {
    name: "The Practical Genius",
    emoji: "🎯",
    description: "Your gifts are useful, well-researched, and always appreciated for their functionality.",
    traits: ["Solution-oriented", "Research-driven", "Value-conscious", "Utility-focused"],
    color: "from-green-500 to-emerald-500",
    percentage: 0,
  },
  showoff: {
    name: "The Grand Gesture Maker",
    emoji: "👑",
    description: "You believe in going big and making a statement with impressive, memorable gifts.",
    traits: ["Bold and confident", "Status-aware", "Generous spirit", "Attention to impact"],
    color: "from-yellow-500 to-orange-500",
    percentage: 0,
  },
  spontaneous: {
    name: "The Spontaneous Surprise Artist",
    emoji: "🎪",
    description: "You thrive on last-minute inspiration and unexpected gift-giving moments.",
    traits: ["Spontaneous", "Intuitive", "Flexible", "Moment-driven"],
    color: "from-red-500 to-pink-500",
    percentage: 0,
  },
}

export function GiftDNAQuiz({ userTier }: GiftDNAQuizProps) {
  const [currentStep, setCurrentStep] = useState(0) // 0 = intro, 1-7 = questions, 8 = results
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [giftingProfile, setGiftingProfile] = useState<any>(null)

  const isQuizStep = currentStep >= 1 && currentStep <= quizQuestions.length
  const progress = isQuizStep ? ((currentStep - 1) / quizQuestions.length) * 100 : 0

  const handleAnswer = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const calculateResults = () => {
    const scores: Record<string, number> = {}

    // Initialize scores
    Object.keys(giftingPersonalities).forEach((type) => {
      scores[type] = 0
    })

    // Calculate scores based on answers
    quizQuestions.forEach((question) => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find((opt) => opt.id === answer)
        if (option) {
          Object.entries(option.points).forEach(([trait, points]) => {
            scores[trait] = (scores[trait] || 0) + points
          })
        }
      }
    })

    // Find primary and secondary types
    const sortedTypes = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    const totalPoints = Object.values(scores).reduce((sum, score) => sum + score, 0)

    // Calculate percentages
    const profileWithPercentages = { ...giftingPersonalities }
    Object.keys(profileWithPercentages).forEach((type) => {
      profileWithPercentages[type as keyof typeof profileWithPercentages].percentage =
        totalPoints > 0 ? Math.round((scores[type] / totalPoints) * 100) : 0
    })

    const primaryType = sortedTypes[0][0]
    const secondaryType = sortedTypes[1][0]

    setGiftingProfile({
      primary: profileWithPercentages[primaryType as keyof typeof profileWithPercentages],
      secondary: profileWithPercentages[secondaryType as keyof typeof profileWithPercentages],
      allTypes: profileWithPercentages,
      scores: sortedTypes,
    })
    setShowResults(true)
  }

  const nextStep = () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else if (currentStep < quizQuestions.length) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === quizQuestions.length) {
      calculateResults()
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowResults(false)
    }
  }

  const currentQuestion = isQuizStep ? quizQuestions[currentStep - 1] : null
  const canProceed = currentStep === 0 || !isQuizStep || answers[currentStep]

  return (
    <UserTierGate userTier={userTier} requiredTier={TIERS.PREMIUM_SPY} featureName="Gift DNA Quiz">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Intro Step */}
        {currentStep === 0 && (
          <Card className="text-center">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🧬
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Discover Your Gift DNA
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Take our fun 7-question quiz to unlock your unique gifting personality and become a master gift-giver
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.values(giftingPersonalities).map((personality, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-3xl mb-2">{personality.emoji}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {personality.name.split(" ").slice(-1)[0]}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quiz Questions */}
        {isQuizStep && currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentStep} of {quizQuestions.length}
                </span>
                <Progress value={progress} className="w-32" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option.id}
                    variant={answers[currentStep] === option.id ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto p-4 ${
                      answers[currentStep] === option.id
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                    }`}
                    onClick={() => handleAnswer(currentStep, option.id)}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${
                        answers[currentStep] === option.id
                          ? "border-white bg-white"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {answers[currentStep] === option.id && <div className="w-3 h-3 rounded-full bg-purple-600" />}
                    </span>
                    {option.text}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-gray-300 dark:border-gray-600 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {currentStep === quizQuestions.length ? "See Results" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {showResults && giftingProfile && (
          <div className="space-y-6">
            {/* Primary Result */}
            <Card className="overflow-hidden">
              <div className={`bg-gradient-to-r ${giftingProfile.primary.color} p-6 text-white`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{giftingProfile.primary.emoji}</div>
                  <h2 className="text-3xl font-bold mb-2">{giftingProfile.primary.name}</h2>
                  <p className="text-lg opacity-90">{giftingProfile.primary.description}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Key Traits:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {giftingProfile.primary.traits.map((trait: string, index: number) => (
                    <Badge key={index} variant="secondary" className="justify-center py-2">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Secondary Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Your Secondary Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${giftingProfile.secondary.color} rounded-full flex items-center justify-center text-2xl`}
                  >
                    {giftingProfile.secondary.emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{giftingProfile.secondary.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{giftingProfile.secondary.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Your Complete Gift DNA Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(giftingProfile.allTypes).map(([key, personality]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{personality.emoji}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{personality.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${personality.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${personality.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                          {personality.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Personalized Gift Ideas
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-gray-300 dark:border-gray-600 bg-transparent"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Share Your Results
              </Button>
            </div>

            {/* Retake Quiz */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentStep(0)
                  setAnswers({})
                  setShowResults(false)
                  setGiftingProfile(null)
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </UserTierGate>
  )
} 