"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Users, Gift, Star, Trophy, Sparkles, Flag, MessageCircle, QrCode, Volume2 } from "lucide-react"
import { toast } from "sonner"

interface Quest {
  id: string
  title: string
  description: string
  type: string
  xpReward: number
  maxProgress: number
  currentProgress?: number
  completed: boolean
  completedAt?: string
  availableUntil: string
}

interface AllySquad {
  id: string
  name: string
  description: string
  member_count: number
  current_mission: string
  xp_bonus: number
  isJoined: boolean
}

interface SeasonalInfo {
  season: string
  description: string
  multiplier?: number
  specialFeatures?: string[]
  endDate: string
}

const IDENTITY_OPTIONS = [
  { id: "lesbian", label: "Lesbian", flag: "🏳️‍🌈" },
  { id: "gay", label: "Gay", flag: "🏳️‍🌈" },
  { id: "bisexual", label: "Bisexual", flag: "💗💜💙" },
  { id: "transgender", label: "Transgender", flag: "🏳️‍⚧️" },
  { id: "queer", label: "Queer", flag: "🌈" },
  { id: "questioning", label: "Questioning", flag: "❓" },
  { id: "intersex", label: "Intersex", flag: "💛💜" },
  { id: "asexual", label: "Asexual", flag: "🖤🤍💜" },
  { id: "pansexual", label: "Pansexual", flag: "💗💛💙" },
  { id: "ally", label: "Ally", flag: "🤝" },
]

const CARE_KIT_TEMPLATES = [
  {
    id: "coming_out_support",
    title: "Coming Out Support Kit",
    description: "Encouraging messages and resources for someone sharing their identity",
    icon: "💌",
  },
  {
    id: "transition_celebration",
    title: "Transition Celebration Kit",
    description: "Celebrate someone's transition journey with affirming gifts",
    icon: "🎉",
  },
  {
    id: "pride_affirmation",
    title: "Pride Affirmation Kit",
    description: "Identity-affirming messages and pride-themed surprises",
    icon: "🏳️‍🌈",
  },
  {
    id: "general_support",
    title: "General Support Kit",
    description: "All-purpose emotional support and encouragement",
    icon: "🤗",
  },
]

export default function PrideAlliancePage() {
  const [mounted, setMounted] = useState(false)
  const [quests, setQuests] = useState<Quest[]>([])
  const [allySquads, setAllySquads] = useState<AllySquad[]>([])
  const [seasonalInfo, setSeasonalInfo] = useState<SeasonalInfo | null>(null)
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    questsCompleted: 0,
    careKitsSent: 0,
    friendsNominated: 0,
    currentLevel: 1,
  })

  // Modal states
  const [careKitModalOpen, setCareKitModalOpen] = useState(false)
  const [nominationModalOpen, setNominationModalOpen] = useState(false)
  const [identityModalOpen, setIdentityModalOpen] = useState(false)

  // Form states
  const [careKitForm, setCareKitForm] = useState({
    templateId: "",
    recipientName: "",
    personalMessage: "",
    deliveryMethod: "text",
  })

  const [nominationForm, setNominationForm] = useState({
    nomineeName: "",
    reason: "",
    giftCategory: "",
  })

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true)
    loadPrideAllianceData()
  }, [])

  const loadPrideAllianceData = async () => {
    try {
      setLoading(true)

      // Simulate API calls with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock quests data
      const mockQuests: Quest[] = [
        {
          id: "pride-drops-quest",
          title: "🎉 Complete 3 Pride Drops",
          description: "Send 3 identity-affirming gifts this week",
          type: "pride_drops",
          xpReward: 50,
          maxProgress: 3,
          currentProgress: 1,
          completed: false,
          availableUntil: "2024-07-31",
        },
        {
          id: "ally-squad-quest",
          title: "🫂 Join an Ally Squad",
          description: "Connect with allies and complete a group mission",
          type: "ally_squad",
          xpReward: 25,
          maxProgress: 1,
          currentProgress: 0,
          completed: false,
          availableUntil: "2024-12-31",
        },
        {
          id: "care-kit-quest",
          title: "💌 Send a Care Kit",
          description: "Create and send a coming-out support care kit",
          type: "care_kit",
          xpReward: 40,
          maxProgress: 1,
          currentProgress: 0,
          completed: false,
          availableUntil: "2024-12-31",
        },
      ]

      // Mock ally squads data
      const mockSquads: AllySquad[] = [
        {
          id: "1",
          name: "Rainbow Warriors",
          description: "Supporting LGBTQ+ youth through thoughtful gifting",
          member_count: 247,
          current_mission: "Send care packages to LGBTQ+ teens",
          xp_bonus: 15,
          isJoined: false,
        },
        {
          id: "2",
          name: "Pride Parents",
          description: "Parents and allies supporting LGBTQ+ family members",
          member_count: 189,
          current_mission: "Create coming-out celebration kits",
          xp_bonus: 20,
          isJoined: true,
        },
        {
          id: "3",
          name: "Trans Allies",
          description: "Supporting transgender community with affirming gifts",
          member_count: 156,
          current_mission: "Curate transition milestone gifts",
          xp_bonus: 25,
          isJoined: false,
        },
      ]

      // Mock seasonal info
      const mockSeasonalInfo: SeasonalInfo = {
        season: "Pride Month",
        description: "Celebrate identity and love with enhanced XP rewards!",
        multiplier: 1.5,
        endDate: "2024-07-31",
      }

      setQuests(mockQuests)
      setAllySquads(mockSquads)
      setSeasonalInfo(mockSeasonalInfo)
      setUserStats({
        totalXP: 1250,
        questsCompleted: 3,
        careKitsSent: 2,
        friendsNominated: 1,
        currentLevel: 2,
      })
    } catch (error) {
      console.error("Error loading Pride Alliance data:", error)
      if (mounted) {
        toast.error("Failed to load Pride Alliance data")
      }
    } finally {
      setLoading(false)
    }
  }

  const completeQuest = async (questId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setQuests((prev) =>
        prev.map((quest) =>
          quest.id === questId ? { ...quest, completed: true, completedAt: new Date().toISOString() } : quest,
        ),
      )

      const quest = quests.find((q) => q.id === questId)
      if (quest) {
        const xpEarned = seasonalInfo?.multiplier
          ? Math.floor(quest.xpReward * seasonalInfo.multiplier)
          : quest.xpReward
        setUserStats((prev) => ({
          ...prev,
          totalXP: prev.totalXP + xpEarned,
          questsCompleted: prev.questsCompleted + 1,
        }))

        if (mounted) {
          toast.success(
            `Quest completed! +${xpEarned} XP earned${seasonalInfo?.multiplier ? " (seasonal bonus applied!)" : ""}`,
          )
        }
      }
    } catch (error) {
      if (mounted) {
        toast.error("Failed to complete quest")
      }
    }
  }

  const joinAllySquad = async (squadId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setAllySquads((prev) =>
        prev.map((squad) =>
          squad.id === squadId ? { ...squad, isJoined: true, member_count: squad.member_count + 1 } : squad,
        ),
      )

      const squad = allySquads.find((s) => s.id === squadId)
      if (squad && mounted) {
        setUserStats((prev) => ({
          ...prev,
          totalXP: prev.totalXP + 25,
        }))
        toast.success(`Joined ${squad.name}! +25 XP earned`)
      }
    } catch (error) {
      if (mounted) {
        toast.error("Failed to join ally squad")
      }
    }
  }

  const sendCareKit = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUserStats((prev) => ({
        ...prev,
        totalXP: prev.totalXP + 40,
        careKitsSent: prev.careKitsSent + 1,
      }))

      setCareKitModalOpen(false)
      setCareKitForm({
        templateId: "",
        recipientName: "",
        personalMessage: "",
        deliveryMethod: "text",
      })

      if (mounted) {
        toast.success("Care kit sent successfully! +40 XP earned")
      }
    } catch (error) {
      if (mounted) {
        toast.error("Failed to send care kit")
      }
    }
  }

  const submitNomination = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUserStats((prev) => ({
        ...prev,
        totalXP: prev.totalXP + 30,
        friendsNominated: prev.friendsNominated + 1,
      }))

      setNominationModalOpen(false)
      setNominationForm({
        nomineeName: "",
        reason: "",
        giftCategory: "",
      })

      if (mounted) {
        toast.success("Friend nominated successfully! +30 XP earned")
      }
    } catch (error) {
      if (mounted) {
        toast.error("Failed to submit nomination")
      }
    }
  }

  const updateIdentityFilters = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIdentityModalOpen(false)
      if (mounted) {
        toast.success("Identity filters updated!")
      }
    } catch (error) {
      if (mounted) {
        toast.error("Failed to update identity filters")
      }
    }
  }

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-4xl">🌈</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              GiftVerse Pride Alliance™
            </h1>
            <div className="text-4xl">🏳️‍🌈</div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Inclusive emotional gifting with identity-aware suggestions, coming-out care kits, and seasonal quests
          </p>

          {/* Seasonal Banner */}
          {seasonalInfo && (
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">{seasonalInfo.season}</span>
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm mt-1">{seasonalInfo.description}</p>
              {seasonalInfo.multiplier && (
                <Badge variant="secondary" className="mt-2">
                  {seasonalInfo.multiplier}x XP Multiplier Active!
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{userStats.totalXP}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{userStats.questsCompleted}</div>
              <div className="text-sm text-gray-600">Quests Done</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-500" />
              <div className="text-2xl font-bold">{userStats.careKitsSent}</div>
              <div className="text-sm text-gray-600">Care Kits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{userStats.friendsNominated}</div>
              <div className="text-sm text-gray-600">Nominations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flag className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{userStats.currentLevel}</div>
              <div className="text-sm text-gray-600">Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="quests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quests">🎯 Quests</TabsTrigger>
            <TabsTrigger value="squads">🤝 Ally Squads</TabsTrigger>
            <TabsTrigger value="care-kits">💌 Care Kits</TabsTrigger>
            <TabsTrigger value="filters">🏳️‍🌈 Identity</TabsTrigger>
          </TabsList>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            <div className="grid gap-6">
              {quests.map((quest) => (
                <Card key={quest.id} className={quest.completed ? "bg-green-50 border-green-200" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {quest.title}
                        {quest.completed && <Badge variant="secondary">Completed</Badge>}
                      </CardTitle>
                      <Badge variant="outline">+{quest.xpReward} XP</Badge>
                    </div>
                    <CardDescription>{quest.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quest.currentProgress !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>
                              {quest.currentProgress}/{quest.maxProgress}
                            </span>
                          </div>
                          <Progress value={(quest.currentProgress / quest.maxProgress) * 100} />
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Available until: {new Date(quest.availableUntil).toLocaleDateString()}
                        </span>
                        {!quest.completed && (
                          <Button
                            onClick={() => completeQuest(quest.id)}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                          >
                            Complete Quest
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ally Squads Tab */}
          <TabsContent value="squads" className="space-y-6">
            <div className="grid gap-6">
              {allySquads.map((squad) => (
                <Card key={squad.id} className={squad.isJoined ? "bg-blue-50 border-blue-200" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {squad.name}
                        {squad.isJoined && <Badge variant="secondary">Joined</Badge>}
                      </CardTitle>
                      <Badge variant="outline">+{squad.xp_bonus} XP Bonus</Badge>
                    </div>
                    <CardDescription>{squad.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {squad.member_count} members
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-1">Current Mission:</div>
                        <div className="text-sm text-gray-600">{squad.current_mission}</div>
                      </div>
                      {!squad.isJoined && (
                        <Button
                          onClick={() => joinAllySquad(squad.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          Join Squad
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Care Kits Tab */}
          <TabsContent value="care-kits" className="space-y-6">
            <div className="text-center">
              <Dialog open={careKitModalOpen} onOpenChange={setCareKitModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Create Care Kit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Coming-Out Care Kit</DialogTitle>
                    <DialogDescription>
                      Send supportive messages and resources to someone sharing their identity
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Choose Template</label>
                      <div className="grid grid-cols-2 gap-3">
                        {CARE_KIT_TEMPLATES.map((template) => (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-colors ${
                              careKitForm.templateId === template.id ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                            }`}
                            onClick={() => setCareKitForm((prev) => ({ ...prev, templateId: template.id }))}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">{template.icon}</div>
                              <div className="font-medium text-sm">{template.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipient Name</label>
                      <Input
                        value={careKitForm.recipientName}
                        onChange={(e) => setCareKitForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="Enter recipient's name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Personal Message</label>
                      <Textarea
                        value={careKitForm.personalMessage}
                        onChange={(e) => setCareKitForm((prev) => ({ ...prev, personalMessage: e.target.value }))}
                        placeholder="Write a supportive message..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Delivery Method</label>
                      <Select
                        value={careKitForm.deliveryMethod}
                        onValueChange={(value) => setCareKitForm((prev) => ({ ...prev, deliveryMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Text Message
                            </div>
                          </SelectItem>
                          <SelectItem value="voice">
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-4 w-4" />
                              Voice Message
                            </div>
                          </SelectItem>
                          <SelectItem value="qr">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4" />
                              QR Code
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={sendCareKit}
                      className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                      disabled={!careKitForm.templateId || !careKitForm.recipientName}
                    >
                      Send Care Kit (+40 XP)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CARE_KIT_TEMPLATES.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{template.icon}</span>
                      {template.title}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        setCareKitForm((prev) => ({ ...prev, templateId: template.id }))
                        setCareKitModalOpen(true)
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Identity Filters Tab */}
          <TabsContent value="filters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity-Aware Gifting Filters</CardTitle>
                <CardDescription>
                  Select your identity preferences to receive personalized gift suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {IDENTITY_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedIdentities.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIdentities((prev) => [...prev, option.id])
                          } else {
                            setSelectedIdentities((prev) => prev.filter((id) => id !== option.id))
                          }
                        }}
                      />
                      <label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                        <span>{option.flag}</span>
                        <span className="text-sm">{option.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={updateIdentityFilters}
                  className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Update Filters
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating Nomination Button */}
        <Dialog open={nominationModalOpen} onOpenChange={setNominationModalOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
            >
              <Gift className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nominate LGBTQ+ Friend</DialogTitle>
              <DialogDescription>Nominate a friend to receive a surprise gift drop</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Friend's Name</label>
                <Input
                  value={nominationForm.nomineeName}
                  onChange={(e) => setNominationForm((prev) => ({ ...prev, nomineeName: e.target.value }))}
                  placeholder="Enter your friend's name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Why are you nominating them?</label>
                <Textarea
                  value={nominationForm.reason}
                  onChange={(e) => setNominationForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Share why they deserve a special gift..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Gift Category</label>
                <Select
                  value={nominationForm.giftCategory}
                  onValueChange={(value) => setNominationForm((prev) => ({ ...prev, giftCategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self-care">Self-Care & Wellness</SelectItem>
                    <SelectItem value="pride-items">Pride & Identity Items</SelectItem>
                    <SelectItem value="books">Books & Resources</SelectItem>
                    <SelectItem value="experiences">Experiences & Activities</SelectItem>
                    <SelectItem value="creative">Creative & Artistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={submitNomination}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                disabled={!nominationForm.nomineeName || !nominationForm.reason}
              >
                Submit Nomination (+30 XP)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
