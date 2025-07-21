"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Ghost,
  Clock,
  Trophy,
  Lock,
  Share2,
  Lightbulb,
  CheckCircle,
  Gift,
  Brain,
  MonitorIcon as Mirror,
  Scroll,
  Heart,
} from "lucide-react"
import { toast } from "sonner"

interface GhostClue {
  id: string
  title: string
  location: string
  objective: string
  clueType: string
  prompt: string
  timeLimit: number
  isRare: boolean
  solved: boolean
  answer?: string
  icon: React.ComponentType<{ className?: string }>
}

interface HuntSession {
  userId: string
  huntName: string
  season: string
  userTier: string
  participationType: string
  deliveryMedium: string
  toneStyle: string
  currentClue: number
  timeRemaining: number
  totalXP: number
  badges: string[]
  startTime: Date
  isActive: boolean
  clues: GhostClue[]
}

const HUNT_NAMES = [
  "Phantom of the Wishlist",
  "Cupid's Curse",
  "Frostbite Files",
  "Summer Specter Series",
  "Haunting Holidays",
  "Valentine's Vault",
  "Spring Spirit Quest",
]

const SEASONS = ["Halloween", "Winter", "Valentine's", "Summer", "Spring", "Holiday"]
const USER_TIERS = ["Free", "Pro", "Premium"]
const PARTICIPATION_TYPES = ["Solo", "Team"]
const DELIVERY_MEDIUMS = ["Blog", "Email", "Pinterest Board", "IG Stories", "Web App", "Embedded Newsletter"]
const TONE_STYLES = ["Spooky-Witty", "Cozy-Chaotic", "Love-Sick", "Detective-Cool", "Mystical-Fun"]

const CLUE_TYPES = [
  { id: "emoji", name: "Emoji Gift Riddle", icon: Heart },
  { id: "logic", name: "Logic-Based Gift Match", icon: Brain },
  { id: "reflection", name: "Reflection Question", icon: Mirror },
  { id: "historical", name: "Historical Gifting Mystery", icon: Scroll },
  { id: "surprise", name: "Surprise Unwrap Guess", icon: Gift },
]

export default function GhostHuntPage() {
  const [session, setSession] = useState<HuntSession | null>(null)
  const [setupData, setSetupData] = useState({
    userId: "user-123",
    huntName: "",
    season: "",
    userTier: "Free",
    participationType: "Solo",
    deliveryMedium: "Web App",
    toneStyle: "",
  })
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [usedHints, setUsedHints] = useState<string[]>([])
  const [completedHunt, setCompletedHunt] = useState(false)

  // Timer effect
  useEffect(() => {
    if (session?.isActive && session.timeRemaining > 0) {
      const timer = setInterval(() => {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                timeRemaining: prev.timeRemaining - 1,
              }
            : null,
        )
      }, 1000)
      return () => clearInterval(timer)
    } else if (session?.isActive && session.timeRemaining === 0) {
      endHunt(false)
    }
  }, [session?.isActive, session?.timeRemaining])

  const generateClues = (huntName: string, season: string, toneStyle: string): GhostClue[] => {
    const clueTemplates = [
      {
        title: "The Whispering Wishlist",
        location: "AgentGift.ai Blog",
        objective: "Find the item most likely to spark a ghost's joy",
        clueType: "Logic-Based Gift Match",
        prompt:
          "This cozy item is silent but screams love. It's worn but not loud. It's not a blanket, but it hugs like one. What is it?",
        timeLimit: 6,
        isRare: false,
        icon: Brain,
      },
      {
        title: "Phantom's Reflection",
        location: "Pinterest Board - Seasonal Spirits",
        objective: "Decode the emotional meaning behind a ghostly gift",
        clueType: "Reflection Question",
        prompt:
          "A ghost can only give one gift to the living. What would yours be, and why would it matter more than gold?",
        timeLimit: 8,
        isRare: false,
        icon: Mirror,
      },
      {
        title: "Emoji Séance",
        location: "IG Stories - Haunted Hints",
        objective: "Translate the ghost's emoji message into a gift",
        clueType: "Emoji Gift Riddle",
        prompt: "👻 + 🕯️ + 📚 + ☕ = ? (The ghost's favorite evening ritual)",
        timeLimit: 5,
        isRare: false,
        icon: Heart,
      },
      {
        title: "Ancient Gift Curse",
        location: "Email Newsletter - Spectral Stories",
        objective: "Solve the historical mystery of the cursed gift",
        clueType: "Historical Gifting Mystery",
        prompt:
          "In 1800s England, this gift was considered bad luck if given by a lover, but good fortune if given by a friend. What was it?",
        timeLimit: 7,
        isRare: false,
        icon: Scroll,
      },
      {
        title: "The Phantom Package",
        location: "Web App - Secret Section",
        objective: "Unwrap the mystery gift using only clues",
        clueType: "Surprise Unwrap Guess",
        prompt:
          "It's not alive, but it grows. It's not food, but it feeds the soul. Ghosts love it because it never fades. What's in the box?",
        timeLimit: 6,
        isRare: false,
        icon: Gift,
      },
      {
        title: "Cupid's Tomb",
        location: "Pinterest Board - Romantic Misfires",
        objective: "Decode the gift that ended 3 relationships but saved 5 others",
        clueType: "Surprise Unwrap Guess",
        prompt:
          "Hidden in the depths of romantic chaos lies a gift so powerful it can destroy or create love. Follow the spectral trail through failed Valentine's posts to find it.",
        timeLimit: 10,
        isRare: true,
        icon: Heart,
      },
    ]

    return clueTemplates.map((template, index) => ({
      ...template,
      id: `clue-${index}`,
      solved: false,
    }))
  }

  const startHunt = () => {
    if (!setupData.huntName || !setupData.season || !setupData.toneStyle) {
      toast.error("Please fill in all required fields")
      return
    }

    const clues = generateClues(setupData.huntName, setupData.season, setupData.toneStyle)

    const newSession: HuntSession = {
      ...setupData,
      currentClue: 0,
      timeRemaining: 1200, // 20 minutes
      totalXP: 0,
      badges: [],
      startTime: new Date(),
      isActive: true,
      clues,
    }

    setSession(newSession)
    toast.success(`👻 Welcome to the Ghost Gift Hunt™: ${setupData.huntName}!`)
  }

  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer")
      return
    }

    if (!session) return

    const currentClueData = session.clues[session.currentClue]
    if (!currentClueData) return

    // Mark clue as solved
    const updatedClues = session.clues.map((clue, index) =>
      index === session.currentClue ? { ...clue, solved: true, answer: currentAnswer } : clue,
    )

    // Calculate XP reward
    const xpReward = currentClueData.isRare ? 10 : 5
    const newTotalXP = session.totalXP + xpReward

    // Update session
    setSession({
      ...session,
      currentClue: session.currentClue + 1,
      totalXP: newTotalXP,
      clues: updatedClues,
    })

    setCurrentAnswer("")
    toast.success(`Clue solved! +${xpReward} XP earned`)

    // Check if hunt is complete
    if (session.currentClue + 1 >= session.clues.length) {
      endHunt(true)
    }
  }

  const endHunt = (completed: boolean) => {
    if (!session) return

    const timeTaken = Math.floor((Date.now() - session.startTime.getTime()) / 1000)
    const completionTime = 1200 - session.timeRemaining

    let finalXP = session.totalXP
    const badges = [...session.badges]

    if (completed) {
      finalXP += 20 // Completion bonus
      badges.push(`${session.season} Ghost Hunter`)

      if (completionTime < 1200) {
        // Under 20 minutes
        badges.push("Speed Seeker")
        finalXP += 10
      }
    }

    setSession({
      ...session,
      isActive: false,
      totalXP: finalXP,
      badges,
    })

    setCompletedHunt(true)

    if (completed) {
      toast.success("👻 Hunt completed! Generating your Ghost Report Card...")
    } else {
      toast.error("⏰ Time's up! Hunt ended.")
    }
  }

  const buyHint = () => {
    if (!session || usedHints.includes(session.clues[session.currentClue]?.id)) {
      toast.error("Hint already used for this clue")
      return
    }

    setUsedHints([...usedHints, session.clues[session.currentClue]?.id])
    setShowHint(true)
    toast.success("Hint revealed! 💡")
  }

  const getHintText = (clue: GhostClue): string => {
    const hints = {
      "clue-0": "Think about something you wear that provides comfort and warmth...",
      "clue-1": "Consider what connects us to memories of loved ones...",
      "clue-2": "The ghost enjoys quiet evenings with literature and warm drinks...",
      "clue-3": "Think about mirrors and their superstitions...",
      "clue-4": "Something that captures moments and preserves them forever...",
      "clue-5": "Look for posts about Valentine's Day disasters...",
    }
    return hints[clue.id as keyof typeof hints] || "No hint available"
  }

  const generateNickname = (xp: number, badges: string[]): string => {
    if (xp >= 60) return "The Phantom Master"
    if (xp >= 45) return "Spectral Sleuth"
    if (xp >= 30) return "Ghost Whisperer"
    if (xp >= 15) return "Spirit Seeker"
    return "Rookie Phantom"
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getSuccessScore = (): number => {
    if (!session) return 0
    const solvedClues = session.clues.filter((c) => c.solved).length
    return Math.round((solvedClues / session.clues.length) * 100)
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            👻 Ghost Gift Hunt™
          </h1>
          <p className="text-lg text-muted-foreground">
            A gamified scavenger hunt that rewards emotional intelligence and seasonal spirit
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ghost className="h-5 w-5" />
              Hunt Configuration
            </CardTitle>
            <CardDescription>Configure your spectral scavenger hunt experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="huntName">Hunt Name *</Label>
              <Select
                value={setupData.huntName}
                onValueChange={(value) => setSetupData((prev) => ({ ...prev, huntName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your hunt" />
                </SelectTrigger>
                <SelectContent>
                  {HUNT_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Season *</Label>
                <Select
                  value={setupData.season}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, season: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>User Tier</Label>
                <Select
                  value={setupData.userTier}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, userTier: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Participation Type</Label>
                <Select
                  value={setupData.participationType}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, participationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTICIPATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delivery Medium</Label>
                <Select
                  value={setupData.deliveryMedium}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, deliveryMedium: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_MEDIUMS.map((medium) => (
                      <SelectItem key={medium} value={medium}>
                        {medium}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tone Style *</Label>
              <Select
                value={setupData.toneStyle}
                onValueChange={(value) => setSetupData((prev) => ({ ...prev, toneStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_STYLES.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {setupData.userTier === "Free" && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>One attempt only if you're on Free Tier.</strong> Pro users get unlimited hunts and bonus
                  features!
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={startHunt} className="w-full" size="lg">
              Start Ghost Hunt
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (completedHunt) {
    const nickname = generateNickname(session.totalXP, session.badges)
    const successScore = getSuccessScore()

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎖️ Ghost Report Card
          </h1>
          <p className="text-lg text-muted-foreground">Hunt Complete: {session.huntName}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hunt Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Nickname:</span>
                <Badge variant="secondary" className="text-lg">
                  {nickname}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Success Score:</span>
                <Badge variant={successScore >= 80 ? "default" : "outline"}>{successScore}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>XP Earned:</span>
                <span className="font-bold">{session.totalXP}</span>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Badges Earned:</span>
                <div className="flex flex-wrap gap-2">
                  {session.badges.map((badge, index) => (
                    <Badge key={index} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Trophy className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clue Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.clues.map((clue, index) => (
                  <div key={clue.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <clue.icon className="h-4 w-4" />
                      <span className="text-sm">{clue.title}</span>
                      {clue.isRare && (
                        <Badge variant="outline" className="text-xs">
                          Rare
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {clue.solved ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-xs">{clue.solved ? `+${clue.isRare ? 10 : 5} XP` : "Not solved"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Share Your Achievement</h3>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                  <p className="font-medium">"{nickname}"</p>
                  <p className="text-sm text-muted-foreground">
                    Completed {session.huntName} with {successScore}% success rate
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Badge: {session.badges[0] || "Ghost Hunter"} | XP: {session.totalXP}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Share2 className="h-4 w-4" />
                    Share Badge
                  </Button>
                  <Button variant="outline">Challenge a Friend</Button>
                  <Button
                    onClick={() => {
                      setSession(null)
                      setCompletedHunt(false)
                    }}
                  >
                    New Hunt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {session.userTier === "Free" && (
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Unlock More Ghost Hunts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" size="sm">
                      Reveal Hint - $1.49
                    </Button>
                    <Button variant="outline" size="sm">
                      Auto-Solve Clue - $2.99
                    </Button>
                    <Button variant="outline" size="sm">
                      Season Pass - $6.99
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Active hunt
  const currentClue = session.clues[session.currentClue]
  const progress = ((session.currentClue + 1) / session.clues.length) * 100

  if (!currentClue) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">👻 {session.huntName}</h1>
        <p className="text-muted-foreground">
          You've entered the haunted vault of forgotten gifts...
          {session.userTier === "Free" && <strong> One attempt only if you're on Free Tier.</strong>}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Hunt Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {formatTime(session.timeRemaining)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4" />
                {session.totalXP} XP
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Ghost className="h-4 w-4" />
                Clue {session.currentClue + 1}/{session.clues.length}
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Clue Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.clues.map((clue, index) => (
                  <div key={clue.id} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        clue.solved ? "bg-green-500" : index === session.currentClue ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    />
                    <span className={clue.solved ? "line-through text-muted-foreground" : ""}>{clue.title}</span>
                    {clue.isRare && (
                      <Badge variant="outline" className="text-xs">
                        Rare
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentClue.icon className="h-5 w-5" />🧩 Clue #{session.currentClue + 1}: {currentClue.title}
                {currentClue.isRare && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Rare Ghost Clue</Badge>
                )}
              </CardTitle>
              <CardDescription>
                <div className="space-y-1">
                  <div>📍 Location: {currentClue.location}</div>
                  <div>🎯 Objective: {currentClue.objective}</div>
                  <div>🔍 Clue Type: {currentClue.clueType}</div>
                  <div>🕒 Solve Time Limit: {currentClue.timeLimit} minutes</div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium mb-2">💡 Clue Prompt:</div>
                <div className="text-sm">{currentClue.prompt}</div>
              </div>

              {showHint && usedHints.includes(currentClue.id) && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    Hint:
                  </div>
                  <div className="text-sm text-yellow-700">{getHintText(currentClue)}</div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <Label htmlFor="answer">Your Answer</Label>
                <Input
                  id="answer"
                  placeholder="Enter your solution..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && submitAnswer()}
                />
                <Button onClick={submitAnswer} className="w-full">
                  Submit Answer
                </Button>
              </div>

              <div className="flex gap-2">
                {!usedHints.includes(currentClue.id) && (
                  <Button variant="outline" size="sm" onClick={buyHint} disabled={session.userTier === "Free"}>
                    💡 Reveal Hint ($1.49)
                  </Button>
                )}
                {session.userTier !== "Free" && (
                  <Button variant="outline" size="sm">
                    🔧 Auto-Solve ($2.99)
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  ⏱️ Buy Time (+5 min, $1.99)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
