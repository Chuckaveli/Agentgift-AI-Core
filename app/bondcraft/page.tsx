"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Heart, Clock, Star, Trophy, Play, Pause, RotateCcw, CheckCircle, Sparkles } from "lucide-react"
import { FeatureGateWrapper } from "@/components/ui/FeatureGateWrapper"
import LottieAnimation from "@/components/animations/lottie-animation"

// Mock user data
const mockUser = {
  id: "1",
  name: "Alex Johnson",
  tier: "free_agent", // Change to "premium_spy" to test Pro features
  credits: 150,
  bondcraftUsage: 0,
  bondcraftLimit: 3,
}

interface BondCraftSession {
  id: string
  partnerName: string
  relationshipType: string
  duration: number
  stage: "trivia" | "guessing" | "completed"
  triviaAnswers: Record<string, string>
  guesses: Record<string, string>
  score: number
  createdAt: Date
}

export default function BondCraftPage() {
  const [user] = useState(mockUser)
  const [showIntroModal, setShowIntroModal] = useState(false)
  const [currentSession, setCurrentSession] = useState<BondCraftSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    partnerName: "",
    relationshipType: "",
    duration: 15,
  })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [introAnimation, setIntroAnimation] = useState(null)

  // Load Lottie animations
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const introResponse = await fetch("/agentgift_intro.json")
        const introData = await introResponse.json()
        setIntroAnimation(introData)
      } catch (error) {
        console.error("Failed to load animations:", error)
      }
    }
    loadAnimations()
  }, [])

  // Show intro modal on first visit
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("bondcraft-intro-seen")
    if (!hasSeenIntro && introAnimation) {
      setShowIntroModal(true)
    }
  }, [introAnimation])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeRemaining])

  const handleIntroComplete = () => {
    setShowIntroModal(false)
    localStorage.setItem("bondcraft-intro-seen", "true")
  }

  const handleStartSession = async () => {
    if (!sessionForm.partnerName || !sessionForm.relationshipType) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newSession: BondCraftSession = {
        id: Date.now().toString(),
        partnerName: sessionForm.partnerName,
        relationshipType: sessionForm.relationshipType,
        duration: sessionForm.duration,
        stage: "trivia",
        triviaAnswers: {},
        guesses: {},
        score: 0,
        createdAt: new Date(),
      }

      setCurrentSession(newSession)
      setTimeRemaining(sessionForm.duration * 60)
      setCurrentQuestion(0)
      toast.success("BondCraft™ session started!")
    } catch (error) {
      toast.error("Failed to start session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeUp = () => {
    if (currentSession?.stage === "trivia") {
      setCurrentSession({ ...currentSession, stage: "guessing" })
      setTimeRemaining(currentSession.duration * 60)
      toast.info("Time's up! Moving to guessing phase...")
    } else if (currentSession?.stage === "guessing") {
      setCurrentSession({ ...currentSession, stage: "completed" })
      toast.success("BondCraft™ session completed!")
    }
  }

  const startTimer = () => setIsTimerRunning(true)
  const pauseTimer = () => setIsTimerRunning(false)
  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimeRemaining(currentSession ? currentSession.duration * 60 : 0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const triviaQuestions = [
    {
      id: "favorite_color",
      question: "What is your partner's favorite color?",
      type: "text",
    },
    {
      id: "dream_vacation",
      question: "Where would your partner go for their dream vacation?",
      type: "text",
    },
    {
      id: "comfort_food",
      question: "What is your partner's go-to comfort food?",
      type: "text",
    },
    {
      id: "hobby",
      question: "What hobby would your partner love to try?",
      type: "text",
    },
    {
      id: "movie_genre",
      question: "What's your partner's favorite movie genre?",
      type: "radio",
      options: ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"],
    },
  ]

  const guessingQuestions = [
    {
      id: "gift_preference",
      question: "Your partner would prefer:",
      type: "radio",
      options: ["Practical gifts", "Sentimental gifts", "Experience gifts", "Luxury items"],
    },
    {
      id: "surprise_style",
      question: "Your partner likes surprises that are:",
      type: "radio",
      options: ["Big and elaborate", "Small and thoughtful", "Planned together", "Completely spontaneous"],
    },
    {
      id: "celebration_style",
      question: "For celebrations, your partner prefers:",
      type: "checkbox",
      options: ["Intimate gatherings", "Big parties", "Quiet moments", "Adventure activities"],
    },
  ]

  const renderSessionSetup = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          BondCraft™
        </h1>
        <p className="text-lg text-muted-foreground">
          Deepen your connection through interactive relationship discovery
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start Your BondCraft™ Session</CardTitle>
          <CardDescription>
            Create a personalized experience to learn more about your partner and strengthen your bond.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-name">Partner's Name *</Label>
            <Input
              id="partner-name"
              placeholder="Enter your partner's name"
              value={sessionForm.partnerName}
              onChange={(e) => setSessionForm({ ...sessionForm, partnerName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship-type">Relationship Type *</Label>
            <RadioGroup
              value={sessionForm.relationshipType}
              onValueChange={(value) => setSessionForm({ ...sessionForm, relationshipType: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="romantic" id="romantic" />
                <Label htmlFor="romantic">Romantic Partner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friend" id="friend" />
                <Label htmlFor="friend">Close Friend</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family" id="family" />
                <Label htmlFor="family">Family Member</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Session Duration</Label>
            <RadioGroup
              value={sessionForm.duration.toString()}
              onValueChange={(value) => setSessionForm({ ...sessionForm, duration: Number.parseInt(value) })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="15min" />
                <Label htmlFor="15min">15 minutes (Quick Bond)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="30min" />
                <Label htmlFor="30min">30 minutes (Deep Dive)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="45" id="45min" />
                <Label htmlFor="45min">45 minutes (Complete Journey)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleStartSession}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {isLoading ? "Starting Session..." : "Start BondCraft™ Session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderTriviaPhase = () => {
    const question = triviaQuestions[currentQuestion]
    if (!question) return null

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="mb-2">
            Trivia Phase
          </Badge>
          <h2 className="text-2xl font-bold">Learning About {currentSession?.partnerName}</h2>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {triviaQuestions.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{question.question}</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <Progress value={((currentQuestion + 1) / triviaQuestions.length) * 100} />
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === "text" && (
              <Textarea
                placeholder="Your answer..."
                value={currentSession?.triviaAnswers[question.id] || ""}
                onChange={(e) =>
                  setCurrentSession({
                    ...currentSession!,
                    triviaAnswers: {
                      ...currentSession!.triviaAnswers,
                      [question.id]: e.target.value,
                    },
                  })
                }
              />
            )}

            {question.type === "radio" && question.options && (
              <RadioGroup
                value={currentSession?.triviaAnswers[question.id] || ""}
                onValueChange={(value) =>
                  setCurrentSession({
                    ...currentSession!,
                    triviaAnswers: {
                      ...currentSession!.triviaAnswers,
                      [question.id]: value,
                    },
                  })
                }
              >
                {question.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={isTimerRunning ? pauseTimer : startTimer}>
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                {currentQuestion > 0 && (
                  <Button variant="outline" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                    Previous
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (currentQuestion < triviaQuestions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1)
                    } else {
                      setCurrentSession({ ...currentSession!, stage: "guessing" })
                      setCurrentQuestion(0)
                      setTimeRemaining(currentSession!.duration * 60)
                    }
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {currentQuestion < triviaQuestions.length - 1 ? "Next" : "Start Guessing Phase"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGuessingPhase = () => {
    const question = guessingQuestions[currentQuestion]
    if (!question) return null

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="mb-2">
            Guessing Phase
          </Badge>
          <h2 className="text-2xl font-bold">What Would {currentSession?.partnerName} Choose?</h2>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {guessingQuestions.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{question.question}</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <Progress value={((currentQuestion + 1) / guessingQuestions.length) * 100} />
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === "radio" && question.options && (
              <RadioGroup
                value={currentSession?.guesses[question.id] || ""}
                onValueChange={(value) =>
                  setCurrentSession({
                    ...currentSession!,
                    guesses: {
                      ...currentSession!.guesses,
                      [question.id]: value,
                    },
                  })
                }
              >
                {question.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === "checkbox" && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => {
                  const currentGuesses = currentSession?.guesses[question.id]?.split(",") || []
                  const isChecked = currentGuesses.includes(option)

                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let newGuesses = [...currentGuesses]
                          if (checked) {
                            newGuesses.push(option)
                          } else {
                            newGuesses = newGuesses.filter((g) => g !== option)
                          }
                          setCurrentSession({
                            ...currentSession!,
                            guesses: {
                              ...currentSession!.guesses,
                              [question.id]: newGuesses.join(","),
                            },
                          })
                        }}
                      />
                      <Label htmlFor={option}>{option}</Label>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={isTimerRunning ? pauseTimer : startTimer}>
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                {currentQuestion > 0 && (
                  <Button variant="outline" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                    Previous
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (currentQuestion < guessingQuestions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1)
                    } else {
                      setCurrentSession({ ...currentSession!, stage: "completed", score: 85 })
                    }
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {currentQuestion < guessingQuestions.length - 1 ? "Next" : "Complete Session"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCompletedSession = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Session Complete!</h2>
        <p className="text-lg text-muted-foreground">
          You've strengthened your bond with {currentSession?.partnerName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your BondCraft™ Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {currentSession?.score}%
            </div>
            <p className="text-muted-foreground">Connection Score</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Insights & Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Strong Emotional Connection</p>
                  <p className="text-sm text-muted-foreground">
                    You show great understanding of {currentSession?.partnerName}'s preferences
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Gift Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    Based on your session, consider experience-based gifts that create memories together
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setCurrentSession(null)
                setSessionForm({ partnerName: "", relationshipType: "", duration: 15 })
              }}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Start New Session
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <FeatureGateWrapper
        featureId="bondcraft"
        requiredTier="premium_spy"
        userTier={user.tier}
        usageCount={user.bondcraftUsage}
        usageLimit={user.bondcraftLimit}
      >
        {!currentSession && renderSessionSetup()}
        {currentSession?.stage === "trivia" && renderTriviaPhase()}
        {currentSession?.stage === "guessing" && renderGuessingPhase()}
        {currentSession?.stage === "completed" && renderCompletedSession()}
      </FeatureGateWrapper>

      {/* Intro Modal */}
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Welcome to BondCraft™</DialogTitle>
            <DialogDescription className="text-center">
              Discover deeper connections through interactive relationship exploration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {introAnimation && (
              <div className="w-full h-64 flex items-center justify-center">
                <LottieAnimation animationData={introAnimation} loop={true} className="w-full h-full" />
              </div>
            )}
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                BondCraft™ helps you understand your partner better through guided questions and insights, leading to
                more meaningful gift-giving and stronger relationships.
              </p>
              <Button
                onClick={handleIntroComplete}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-pink-600"
              >
                Let's Begin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
