"use client"

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
import { Clock, Users, Zap, Trophy, Lock, Share2 } from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
  id: string
  name: string
  xp: number
  nickname?: string
}

interface HeistSession {
  teamName: string
  seasonTheme: string
  teamSize: number
  avgXpLevel: string
  tone: string
  userTier: string
  currentPhase: number
  timeRemaining: number
  teamMembers: TeamMember[]
  score: number
  isActive: boolean
}

const SEASONAL_THEMES = [
  "Valentine's Memory Vault",
  "Summer of Surprises",
  "Holiday Memory Vault",
  "Spring Awakening",
  "Autumn Nostalgia",
]

const XP_LEVELS = ["Beginner", "Intermediate", "Operative", "Master"]
const TONES = ["Witty", "Romantic", "Corporate", "Mysterious", "Playful"]
const USER_TIERS = ["Free", "Pro", "Premium"]

export default function ThoughtHeistPage() {
  const [session, setSession] = useState<HeistSession | null>(null)
  const [setupData, setSetupData] = useState({
    teamName: "",
    seasonTheme: "",
    teamSize: 2,
    avgXpLevel: "",
    tone: "",
    userTier: "Free",
  })
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [phaseAnswers, setPhaseAnswers] = useState<string[]>([])

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
    }
  }, [session?.isActive, session?.timeRemaining])

  const startHeist = () => {
    if (!setupData.teamName || !setupData.seasonTheme || !setupData.avgXpLevel || !setupData.tone) {
      toast.error("Please fill in all required fields")
      return
    }

    const newSession: HeistSession = {
      ...setupData,
      currentPhase: 0,
      timeRemaining: 1800, // 30 minutes
      teamMembers: Array.from({ length: setupData.teamSize }, (_, i) => ({
        id: `member-${i}`,
        name: `Player ${i + 1}`,
        xp: 0,
      })),
      score: 0,
      isActive: true,
    }

    setSession(newSession)
    toast.success(`Welcome to The Thought Heist™, ${setupData.teamName}!`)
  }

  const submitPhaseAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer")
      return
    }

    const newAnswers = [...phaseAnswers, currentAnswer]
    setPhaseAnswers(newAnswers)

    // Award XP for completing phase
    if (session) {
      const updatedMembers = session.teamMembers.map((member) => ({
        ...member,
        xp: member.xp + 5,
      }))

      setSession({
        ...session,
        currentPhase: session.currentPhase + 1,
        teamMembers: updatedMembers,
        score: session.score + 20,
      })
    }

    setCurrentAnswer("")
    toast.success("Phase completed! +5 XP awarded to all team members")
  }

  const completeHeist = () => {
    if (!session) return

    // Final XP bonuses
    const finalMembers = session.teamMembers.map((member) => ({
      ...member,
      xp: member.xp + 25, // +10 for completion, +15 for HeartKey
      nickname: generateNickname(member.xp + 25),
    }))

    setSession({
      ...session,
      teamMembers: finalMembers,
      isActive: false,
      score: session.score + 50,
    })

    toast.success("Heist completed! Generating final report...")
  }

  const generateNickname = (xp: number): string => {
    if (xp >= 50) return "Master Vault Cracker"
    if (xp >= 35) return "Emotional Detective"
    if (xp >= 25) return "Memory Hacker"
    if (xp >= 15) return "Gift Whisperer"
    return "Rookie Operative"
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPuzzleContent = (phase: number) => {
    const puzzles = [
      {
        title: "Memory Mirror Match",
        type: "Visual Recall Puzzle",
        objective: "Match 6 memory clips to the gift type that best reflects the feeling",
        timeLimit: "6 minutes",
        content: `You see a collection of emotional moments. Match each to the perfect gift category:
        
        1. A child's first day of school → ?
        2. A couple's anniversary dinner → ?
        3. A friend moving away → ?
        4. A graduation celebration → ?
        5. A comfort during illness → ?
        6. A surprise birthday → ?
        
        Options: Keepsake, Experience, Comfort Item, Achievement Symbol, Memory Book, Surprise Box`,
      },
      {
        title: "Emotional Decoder Ring",
        type: "Pattern Recognition",
        objective: "Decode the hidden emotional pattern in gift preferences",
        timeLimit: "7 minutes",
        content: `Analyze this gift-giving pattern and identify the underlying emotion:
        
        Person A always gives: Books, Tea, Cozy blankets, Journals
        Person B always gives: Concert tickets, Adventure gear, Travel vouchers, Classes
        Person C always gives: Photo albums, Handmade items, Family recipes, Letters
        
        What core emotional need does each person prioritize in their gift-giving?`,
      },
      {
        title: "Cultural Gift Bridge",
        type: "Cross-Cultural Logic",
        objective: "Navigate cultural gift-giving customs without offense",
        timeLimit: "6 minutes",
        content: `You need to give gifts across cultures. Which approach is most respectful?
        
        Scenario: Your international team includes members from Japan, Mexico, and Germany.
        It's the holiday season. How do you approach gift-giving to honor everyone?
        
        Consider: Timing, presentation, value perception, and cultural significance.`,
      },
      {
        title: "Surprise Algorithm",
        type: "Predictive Gifting",
        objective: "Predict the most surprising yet meaningful gift",
        timeLimit: "5 minutes",
        content: `Based on these personality clues, what would be the most surprisingly perfect gift?
        
        Target Profile:
        - Loves routine but secretly craves adventure
        - Collects vintage postcards
        - Always helps others but never asks for help
        - Mentions missing their grandmother's cooking
        - Works in tech but gardens on weekends
        
        What gift would surprise them while touching their heart?`,
      },
    ]

    return puzzles[phase] || puzzles[0]
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            The Thought Heist™
          </h1>
          <p className="text-lg text-muted-foreground">
            A gamified emotional escape room that tests your team's gifting intelligence
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mission Setup
            </CardTitle>
            <CardDescription>Configure your team's emotional intelligence heist</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                placeholder="Enter your team name"
                value={setupData.teamName}
                onChange={(e) => setSetupData((prev) => ({ ...prev, teamName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seasonal Theme *</Label>
                <Select
                  value={setupData.seasonTheme}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, seasonTheme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONAL_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Team Size</Label>
                <Select
                  value={setupData.teamSize.toString()}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, teamSize: Number.parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} players
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Average XP Level *</Label>
                <Select
                  value={setupData.avgXpLevel}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, avgXpLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {XP_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone *</Label>
                <Select
                  value={setupData.tone}
                  onValueChange={(value) => setSetupData((prev) => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            {setupData.userTier === "Free" && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Free users get 1 attempt per day. Upgrade for unlimited heists and bonus features!
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={startHeist} className="w-full" size="lg">
              Start The Heist
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session.currentPhase >= 4) {
    // Final HeartKey Challenge
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Final Challenge: HeartKey Protocol</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(session.timeRemaining)}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Score: {session.score}
            </div>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">❤️ The Ultimate Test</CardTitle>
            <CardDescription className="text-center">
              Which of your teammates would be most surprised by a nostalgic gift?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Instructions:</p>
              <p className="text-sm text-muted-foreground">
                Name the gift and justify why it fits based on their past emotional cues. Use 3 sentences or less. This
                tests your team's emotional intelligence and understanding of each other.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartkey">Your HeartKey Response</Label>
              <textarea
                id="heartkey"
                className="w-full p-3 border rounded-md min-h-[120px]"
                placeholder="Teammate name, gift idea, and emotional reasoning..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />
            </div>

            <Button onClick={completeHeist} className="w-full" size="lg">
              Submit HeartKey & Complete Heist
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session.isActive) {
    // Final Report
    const successScore = Math.min(100, Math.round((session.score / 150) * 100))
    const topOperative = session.teamMembers.reduce((top, member) => (member.xp > top.xp ? member : top))

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎖️ Heist Report
          </h1>
          <p className="text-lg text-muted-foreground">Mission Complete, {session.teamName}!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mission Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Success Score:</span>
                <Badge variant="secondary" className="text-lg">
                  {successScore}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Top Operative:</span>
                <Badge variant="outline">{topOperative.nickname}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Total XP Earned:</span>
                <span className="font-bold">{session.teamMembers.reduce((sum, m) => sum + m.xp, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unlocked Badge:</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {successScore >= 80 ? "Master Heist" : successScore >= 60 ? "Skilled Operative" : "Memory Hacker"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.teamMembers.map((member, index) => (
                  <div key={member.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{member.name}</span>
                      <p className="text-sm text-muted-foreground">{member.nickname}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{member.xp} XP</div>
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
                <h3 className="text-lg font-semibold">Challenge Another Team</h3>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  Replay Code: HEIST-{session.teamName.toUpperCase().slice(0, 4)}-{Date.now().toString().slice(-4)}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Share2 className="h-4 w-4" />
                    Share Badge
                  </Button>
                  <Button onClick={() => setSession(null)}>New Heist</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {session.userTier === "Free" && (
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Unlock More Adventures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" size="sm">
                      Boost Team XP +10 - $1.99
                    </Button>
                    <Button variant="outline" size="sm">
                      Advanced Phase Pack - $3.99
                    </Button>
                    <Button variant="outline" size="sm">
                      Season Pass Access - $5.99
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

  // Active puzzle phase
  const currentPuzzle = getPuzzleContent(session.currentPhase)
  const phaseProgress = ((session.currentPhase + 1) / 5) * 100

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">🎬 Mission: {session.seasonTheme}</h1>
        <p className="text-muted-foreground">
          "Welcome, {session.teamName} Operatives. Deep within the {session.seasonTheme} lies a forgotten memory. You
          have {formatTime(session.timeRemaining)} to decode the core emotion and escape."
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mission Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {formatTime(session.timeRemaining)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4" />
                Score: {session.score}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                Phase {session.currentPhase + 1}/5
              </div>
              <Progress value={phaseProgress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Team XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.teamMembers.map((member, index) => (
                  <div key={member.id} className="flex justify-between text-sm">
                    <span>{member.name}</span>
                    <span className="font-bold">{member.xp} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🧩 {currentPuzzle.title}</CardTitle>
              <CardDescription>
                <div className="space-y-1">
                  <div>🔍 Type: {currentPuzzle.type}</div>
                  <div>🎯 Objective: {currentPuzzle.objective}</div>
                  <div>🕒 Time Limit: {currentPuzzle.timeLimit}</div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="whitespace-pre-line text-sm">{currentPuzzle.content}</div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label htmlFor="answer">Your Team's Answer</Label>
                <textarea
                  id="answer"
                  className="w-full p-3 border rounded-md min-h-[100px]"
                  placeholder="Enter your team's solution..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                <Button onClick={submitPhaseAnswer} className="w-full">
                  Submit Answer & Continue
                </Button>
              </div>

              {session.userTier !== "Free" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    💡 Hint (+$0.99)
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏱️ Extra Time (+$1.99)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
