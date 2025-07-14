"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Heart,
  Rainbow,
  Users,
  Gift,
  Trophy,
  MessageCircle,
  Camera,
  Mic,
  Target,
  Calendar,
  Plus,
  Send,
} from "lucide-react"
import { useGamification } from "@/components/layout/gamification-provider"
import { usePersona } from "@/components/persona/persona-context"
import { toast } from "sonner"

// Pride Alliance specific types
interface PrideQuest {
  id: string
  title: string
  description: string
  xpReward: number
  progress: number
  maxProgress: number
  completed: boolean
  icon: React.ComponentType<{ className?: string }>
  category: "pride_drops" | "ally_squad" | "care_kit" | "postcard"
  availableUntil: string
}

interface AllySquad {
  id: string
  name: string
  description: string
  memberCount: number
  currentMission: string
  xpBonus: number
  isJoined: boolean
}

interface CareKitTemplate {
  id: string
  name: string
  description: string
  category: "coming_out" | "transition" | "celebration" | "support"
  components: string[]
  tone: "supportive" | "celebratory" | "gentle" | "empowering"
}

export default function PrideAlliancePage() {
  const { addXP, xp, level, badges } = useGamification()
  const { currentPersona } = usePersona()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedIdentityFilters, setSelectedIdentityFilters] = useState<string[]>([])
  const [showNominationModal, setShowNominationModal] = useState(false)
  const [showCareKitModal, setShowCareKitModal] = useState(false)
  const [selectedCareKit, setSelectedCareKit] = useState<CareKitTemplate | null>(null)

  // Mock data - in real app, fetch from API
  const [prideQuests, setPrideQuests] = useState<PrideQuest[]>([
    {
      id: "pride-drops-quest",
      title: "🎉 Complete 3 Pride Drops",
      description: "Send 3 identity-affirming gifts this week",
      xpReward: 50,
      progress: 1,
      maxProgress: 3,
      completed: false,
      icon: Gift,
      category: "pride_drops",
      availableUntil: "2024-07-31",
    },
    {
      id: "ally-squad-quest",
      title: "🫂 Join an Ally Squad",
      description: "Connect with allies and complete a group mission",
      xpReward: 25,
      progress: 0,
      maxProgress: 1,
      completed: false,
      icon: Users,
      category: "ally_squad",
      availableUntil: "2024-07-31",
    },
    {
      id: "care-message-quest",
      title: "🎤 Share a Care Message",
      description: "Create a coming-out care message (voice or text)",
      xpReward: 40,
      progress: 0,
      maxProgress: 1,
      completed: false,
      icon: MessageCircle,
      category: "care_kit",
      availableUntil: "2024-10-11",
    },
    {
      id: "postcard-quest",
      title: "📸 Upload 'Proud of You' Postcard",
      description: "Share a digital postcard celebrating identity",
      xpReward: 30,
      progress: 0,
      maxProgress: 1,
      completed: false,
      icon: Camera,
      category: "postcard",
      availableUntil: "2024-07-31",
    },
  ])

  const [allySquads] = useState<AllySquad[]>([
    {
      id: "rainbow-warriors",
      name: "Rainbow Warriors",
      description: "Supporting LGBTQ+ youth through thoughtful gifting",
      memberCount: 247,
      currentMission: "Send care packages to LGBTQ+ teens",
      xpBonus: 15,
      isJoined: false,
    },
    {
      id: "pride-parents",
      name: "Pride Parents",
      description: "Parents and allies supporting LGBTQ+ family members",
      memberCount: 189,
      currentMission: "Create coming-out celebration kits",
      xpBonus: 20,
      isJoined: true,
    },
    {
      id: "trans-allies",
      name: "Trans Allies",
      description: "Supporting transgender community with affirming gifts",
      memberCount: 156,
      currentMission: "Curate transition milestone gifts",
      xpBonus: 25,
      isJoined: false,
    },
  ])

  const [careKitTemplates] = useState<CareKitTemplate[]>([
    {
      id: "coming-out-support",
      name: "Coming Out Support Kit",
      description: "Gentle, affirming messages for someone sharing their identity",
      category: "coming_out",
      components: ["Affirmation card", "Self-care items", "Resource guide", "Personal message"],
      tone: "supportive",
    },
    {
      id: "transition-celebration",
      name: "Transition Celebration Kit",
      description: "Celebrating someone's transition journey with joy",
      category: "transition",
      components: ["Celebration card", "Affirming gifts", "Milestone marker", "Community resources"],
      tone: "celebratory",
    },
    {
      id: "pride-celebration",
      name: "Pride Celebration Kit",
      description: "Celebrating identity with vibrant, joyful gifts",
      category: "celebration",
      components: ["Pride accessories", "Celebration treats", "Affirmation items", "Community connection"],
      tone: "celebratory",
    },
    {
      id: "general-support",
      name: "General Support Kit",
      description: "Ongoing support and affirmation for any time",
      category: "support",
      components: ["Comfort items", "Affirmation notes", "Self-care tools", "Resource links"],
      tone: "gentle",
    },
  ])

  const identityFilters = [
    { id: "lesbian", label: "Lesbian", flag: "🏳️‍🌈" },
    { id: "gay", label: "Gay", flag: "🏳️‍🌈" },
    { id: "bisexual", label: "Bisexual", flag: "💗💜💙" },
    { id: "transgender", label: "Transgender", flag: "🏳️‍⚧️" },
    { id: "queer", label: "Queer", flag: "🏳️‍🌈" },
    { id: "intersex", label: "Intersex", flag: "💛💜" },
    { id: "asexual", label: "Asexual", flag: "🖤🤍💜" },
    { id: "pansexual", label: "Pansexual", flag: "💗💛💙" },
    { id: "nonbinary", label: "Non-binary", flag: "💛🤍💜🖤" },
    { id: "ally", label: "Ally", flag: "🤝" },
  ]

  const handleCompleteQuest = (questId: string) => {
    setPrideQuests((prev) =>
      prev.map((quest) => {
        if (quest.id === questId) {
          const updatedQuest = { ...quest, completed: true, progress: quest.maxProgress }
          addXP(quest.xpReward, `Completed: ${quest.title}`)
          toast.success(`Quest completed! +${quest.xpReward} XP`, {
            description: quest.title,
            duration: 3000,
          })
          return updatedQuest
        }
        return quest
      }),
    )
  }

  const handleJoinAllySquad = (squadId: string) => {
    addXP(25, "Joined Ally Squad")
    toast.success("Welcome to the Ally Squad! +25 XP", {
      description: "You're now part of the community",
      duration: 3000,
    })
  }

  const handleSendCareKit = () => {
    addXP(40, "Sent Care Kit")
    toast.success("Care kit sent! +40 XP", {
      description: "Your support means everything",
      duration: 3000,
    })
    setShowCareKitModal(false)
  }

  const handleNomination = () => {
    addXP(30, "Nominated LGBTQ+ Friend")
    toast.success("Nomination submitted! +30 XP", {
      description: "Thank you for spreading love",
      duration: 3000,
    })
    setShowNominationModal(false)
  }

  const totalQuestXP = prideQuests.reduce((sum, quest) => sum + (quest.completed ? quest.xpReward : 0), 0)
  const completedQuests = prideQuests.filter((quest) => quest.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-4 py-2">
              <Rainbow className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                GiftVerse Pride Alliance™
              </span>
            </div>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Inclusive Emotional
            </span>
            <br />
            Gifting Engine
          </h1>

          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300 sm:text-2xl">
            Identity-aware suggestions, coming-out care kits, ally engagement, and seasonal quests.
          </p>

          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-3 gap-4 rounded-2xl bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalQuestXP}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{completedQuests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Quests Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              onClick={() => setActiveTab("quests")}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Start Pride Quests
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowCareKitModal(true)}>
              <Heart className="mr-2 h-4 w-4" />
              Send Care Kit
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="filters">Identity Filters</TabsTrigger>
              <TabsTrigger value="quests">Pride Quests</TabsTrigger>
              <TabsTrigger value="ally-squads">Ally Squads</TabsTrigger>
              <TabsTrigger value="care-kits">Care Kits</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-pink-600" />
                      Identity-Aware Gifting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Personalized gift suggestions that celebrate and affirm identity
                    </p>
                    <Button size="sm" onClick={() => setActiveTab("filters")}>
                      Configure Filters
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-purple-600" />
                      Coming-Out Care Kits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Supportive care packages for life's important moments
                    </p>
                    <Button size="sm" onClick={() => setShowCareKitModal(true)}>
                      Create Care Kit
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Ally Squad Missions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Join community missions and group gifting initiatives
                    </p>
                    <Button size="sm" onClick={() => setActiveTab("ally-squads")}>
                      Join Squad
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Seasonal Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Seasonal Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                      <div className="font-semibold text-purple-700 dark:text-purple-300">Pride Month</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">June - July</div>
                      <div className="text-xs text-purple-600 mt-1">Enhanced XP rewards active</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                      <div className="font-semibold text-blue-700 dark:text-blue-300">Coming Out Day</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">October 11</div>
                      <div className="text-xs text-blue-600 mt-1">Special care kit templates</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                      <div className="font-semibold text-indigo-700 dark:text-indigo-300">Trans Day of Remembrance</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">November 20</div>
                      <div className="text-xs text-indigo-600 mt-1">Support-focused missions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Identity Filters Tab */}
            <TabsContent value="filters" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Identity-Aware Gifting Filters</CardTitle>
                  <CardDescription>
                    Select identities to receive personalized, affirming gift suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {identityFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={filter.id}
                          checked={selectedIdentityFilters.includes(filter.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIdentityFilters((prev) => [...prev, filter.id])
                            } else {
                              setSelectedIdentityFilters((prev) => prev.filter((id) => id !== filter.id))
                            }
                          }}
                        />
                        <label
                          htmlFor={filter.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                        >
                          <span>{filter.flag}</span>
                          {filter.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedIdentityFilters.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Selected Filters:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIdentityFilters.map((filterId) => {
                          const filter = identityFilters.find((f) => f.id === filterId)
                          return filter ? (
                            <Badge
                              key={filterId}
                              variant="secondary"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                              {filter.flag} {filter.label}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pride Quests Tab */}
            <TabsContent value="quests" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prideQuests.map((quest) => {
                  const IconComponent = quest.icon
                  const progressPercentage = (quest.progress / quest.maxProgress) * 100

                  return (
                    <Card
                      key={quest.id}
                      className={`${quest.completed ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : ""}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-purple-600" />
                            {quest.title}
                          </div>
                          <Badge variant={quest.completed ? "default" : "secondary"}>+{quest.xpReward} XP</Badge>
                        </CardTitle>
                        <CardDescription>{quest.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>
                                {quest.progress}/{quest.maxProgress}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Available until: {new Date(quest.availableUntil).toLocaleDateString()}
                            </div>
                            {!quest.completed && quest.progress < quest.maxProgress && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteQuest(quest.id)}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                              >
                                Complete Quest
                              </Button>
                            )}
                            {quest.completed && (
                              <Badge className="bg-green-600 text-white">
                                <Trophy className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Ally Squads Tab */}
            <TabsContent value="ally-squads" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allySquads.map((squad) => (
                  <Card
                    key={squad.id}
                    className={`${squad.isJoined ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : ""}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        {squad.name}
                      </CardTitle>
                      <CardDescription>{squad.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Members:</span>
                          <span className="font-semibold">{squad.memberCount}</span>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-1">Current Mission:</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{squad.currentMission}</div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">+{squad.xpBonus} XP Bonus</Badge>
                          {squad.isJoined ? (
                            <Badge className="bg-blue-600 text-white">
                              <Users className="w-3 h-3 mr-1" />
                              Joined
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleJoinAllySquad(squad.id)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              Join Squad
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Care Kits Tab */}
            <TabsContent value="care-kits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careKitTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-600" />
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Kit Components:</div>
                          <div className="flex flex-wrap gap-2">
                            {template.components.map((component, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {component}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge
                            className={`${
                              template.tone === "celebratory"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : template.tone === "supportive"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : template.tone === "gentle"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            }`}
                          >
                            {template.tone}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCareKit(template)
                              setShowCareKitModal(true)
                            }}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          >
                            Create Kit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Nomination Modal */}
      <Dialog open={showNominationModal} onOpenChange={setShowNominationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />🎁 LGBTQ+ Nomination Drop
            </DialogTitle>
            <DialogDescription>Nominate someone special in the LGBTQ+ community for a surprise gift</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nominee Name</label>
              <Input placeholder="Enter their name" />
            </div>
            <div>
              <label className="text-sm font-medium">Why they deserve recognition</label>
              <Textarea placeholder="Share what makes them special..." />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Gift Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self-care">Self-Care & Wellness</SelectItem>
                  <SelectItem value="pride-items">Pride Accessories</SelectItem>
                  <SelectItem value="books">Books & Resources</SelectItem>
                  <SelectItem value="experiences">Experiences</SelectItem>
                  <SelectItem value="surprise">Surprise Me!</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleNomination}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Nomination (+30 XP)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Care Kit Modal */}
      <Dialog open={showCareKitModal} onOpenChange={setShowCareKitModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />💌 Create Coming-Out Care Kit
            </DialogTitle>
            <DialogDescription>
              {selectedCareKit ? selectedCareKit.description : "Create a supportive care package"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedCareKit && (
              <div>
                <label className="text-sm font-medium">Care Kit Type</label>
                <Select
                  onValueChange={(value) => {
                    const template = careKitTemplates.find((t) => t.id === value)
                    setSelectedCareKit(template || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select care kit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {careKitTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Recipient Name</label>
              <Input placeholder="Who is this for?" />
            </div>

            <div>
              <label className="text-sm font-medium">Personal Message</label>
              <Textarea placeholder="Write a supportive message..." />
            </div>

            <div>
              <label className="text-sm font-medium">Delivery Method</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="How should this be delivered?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="voice">Voice Message</SelectItem>
                  <SelectItem value="qr">Gifty QR Code</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendCareKit}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Care Kit (+40 XP)
              </Button>
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg"
          onClick={() => setShowNominationModal(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
