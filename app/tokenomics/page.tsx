"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Trophy,
  Star,
  Crown,
  Zap,
  Gift,
  Users,
  Heart,
  MessageSquare,
  Share2,
  UserPlus,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  Coins,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

const XPActions = [
  { action: "Try new feature", xp: 10, icon: Zap },
  { action: "Share a reaction video", xp: 50, icon: Share2 },
  { action: "Complete a Gift Chain", xp: 100, icon: Gift },
  { action: "Invite a friend", xp: 75, icon: UserPlus },
  { action: "Leave a review", xp: 30, icon: MessageSquare },
  { action: "Upload gift photo", xp: 25, icon: Heart },
  { action: "Join seasonal event", xp: 40, icon: Star },
  { action: "Complete profile", xp: 20, icon: Users },
]

const BadgeTypes = [
  {
    name: "Gift Guru",
    type: "Level Badge",
    description: "Reached Level 25",
    color: "bg-blue-500",
    icon: Trophy,
  },
  {
    name: "Summer Vibes",
    type: "Seasonal Badge",
    description: "Participated in Summer 2024 campaign",
    color: "bg-orange-500",
    icon: Star,
  },
  {
    name: "Diamond Elite",
    type: "Prestige Badge",
    description: "Achieved Diamond Prestige status",
    color: "bg-purple-500",
    icon: Crown,
  },
  {
    name: "Chain Master",
    type: "Action Badge",
    description: "Completed 10 gift chains",
    color: "bg-green-500",
    icon: Gift,
  },
]

const CreditPacks = [
  {
    name: "Starter Pack",
    credits: 50,
    xp: 25,
    price: "$9.99",
    popular: false,
  },
  {
    name: "Power Pack",
    credits: 150,
    xp: 75,
    price: "$24.99",
    popular: true,
  },
  {
    name: "Elite Pack",
    credits: 300,
    xp: 150,
    price: "$44.99",
    popular: false,
  },
]

export default function TokenomicsPage() {
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [xpProgress, setXpProgress] = useState(45)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-purple-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AGTE v3.0 System</span>
            </div>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Level Up Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Gifting Game
            </span>
          </h1>

          <p className="mb-8 text-xl text-gray-300 sm:text-2xl">
            Discover how every action earns XP, unlocks rewards, and saves you money long-term.
          </p>

          {/* Animated XP Bar */}
          <div className="mb-8">
            <div className="mx-auto max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
                <span>Level {selectedLevel}</span>
                <span>{xpProgress}/150 XP</span>
              </div>
              <div className="relative h-3 rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${(xpProgress / 150) * 100}%` }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <span className="flex items-center gap-2">
                  Join Now to Start Earning XP
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Flowchart */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Your Gift Quest Progression</h2>
            <p className="text-gray-300 text-lg">See how every action builds toward amazing rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {[
              { icon: Coins, label: "Use Credits", desc: "2 credits per feature" },
              { icon: TrendingUp, label: "Earn XP", desc: "2 credits = 1 XP" },
              { icon: Target, label: "Level Up", desc: "150 XP = 1 Level" },
              { icon: Award, label: "Get Badges", desc: "Unlock achievements" },
              { icon: Crown, label: "Prestige", desc: "Level 100 = Elite status" },
            ].map((step, index) => (
              <div key={index}>
                <Card className="bg-gray-800/50 border-gray-700 text-center">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">{step.label}</h3>
                    <p className="text-sm text-gray-400">{step.desc}</p>
                  </CardContent>
                </Card>
                {index < 4 && (
                  <div className="hidden md:flex justify-center mt-4">
                    <ChevronRight className="h-6 w-6 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* XP Ladder Display */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Climb the Ladder to Greatness</h2>
            <p className="text-gray-300 text-lg">Every 10 levels unlocks new characters and tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-400" />
                    Levels 1-33
                  </CardTitle>
                  <CardDescription className="text-blue-200">Beginner Tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 mb-4">5,000 XP total</p>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li>• Basic AI features</li>
                    <li>• Standard gift suggestions</li>
                    <li>• Community access</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-400" />
                    Levels 34-66
                  </CardTitle>
                  <CardDescription className="text-purple-200">Advanced Tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-100 mb-4">10,000 XP total</p>
                  <ul className="space-y-2 text-sm text-purple-200">
                    <li>• Advanced AI companions</li>
                    <li>• Custom gift campaigns</li>
                    <li>• Priority support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Levels 67-100
                  </CardTitle>
                  <CardDescription className="text-yellow-200">Elite Tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-100 mb-4">15,000 XP total</p>
                  <ul className="space-y-2 text-sm text-yellow-200">
                    <li>• Voice AI agents</li>
                    <li>• Exclusive features</li>
                    <li>• Prestige unlock</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Badge System Preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Badges Worth Bragging About</h2>
            <p className="text-gray-300 text-lg">Collect unique achievements as you master the art of gifting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BadgeTypes.map((badge, index) => (
              <div key={index}>
                <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-colors group">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`mx-auto mb-4 w-16 h-16 rounded-full ${badge.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <badge.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{badge.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {badge.type}
                    </Badge>
                    <p className="text-sm text-gray-400">{badge.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/badges">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
              >
                <span className="flex items-center gap-2">
                  See All Badges
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prestige Tiers */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Happens When You Prestige?</h2>
            <p className="text-gray-300 text-lg">Unlock lifetime rewards and exclusive perks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Card className="bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-gray-800" />
                  </div>
                  <CardTitle className="text-white">Silver Prestige</CardTitle>
                  <CardDescription className="text-gray-300">Level 100 Achievement</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-gray-300 mb-4">10% OFF</div>
                  <p className="text-gray-400 mb-4">Annual plans for life</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Lifetime discount</li>
                    <li>• Silver badge</li>
                    <li>• Priority queue</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gradient-to-br from-yellow-600 to-yellow-500 border-yellow-400 ring-2 ring-yellow-400">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-yellow-300 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-yellow-800" />
                  </div>
                  <CardTitle className="text-white">Gold Prestige</CardTitle>
                  <CardDescription className="text-yellow-100">Level 200 Achievement</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-white mb-4">20% OFF</div>
                  <p className="text-yellow-100 mb-4">Plus rare badge unlock</p>
                  <ul className="text-sm text-yellow-100 space-y-1">
                    <li>• Enhanced discount</li>
                    <li>• Exclusive badges</li>
                    <li>• Beta access</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 ring-2 ring-purple-400">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-purple-800" />
                  </div>
                  <CardTitle className="text-white">Diamond Prestige</CardTitle>
                  <CardDescription className="text-purple-100">Level 300 Achievement</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-white mb-4">50% OFF</div>
                  <p className="text-purple-100 mb-4">Forever + exclusive access</p>
                  <ul className="text-sm text-purple-100 space-y-1">
                    <li>• Maximum discount</li>
                    <li>• Voice agents early access</li>
                    <li>• NFT drop-ins</li>
                    <li>• Partner tools</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* XP Actions Table */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Earn XP While You GIFT</h2>
            <p className="text-gray-300 text-lg">Every action rewards your gifting journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {XPActions.map((action, index) => (
              <div key={index}>
                <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-500/20 p-2">
                        <action.icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-white font-medium">{action.action}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">+{action.xp} XP</Badge>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Packs */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Want to Level Up Faster?</h2>
            <p className="text-gray-300 text-lg">Boost your XP with credit packs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CreditPacks.map((pack, index) => (
              <div key={index}>
                <Card className={`bg-gray-800/50 border-gray-700 ${pack.popular ? "ring-2 ring-purple-500" : ""}`}>
                  {pack.popular && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">{pack.name}</CardTitle>
                    <div className="text-3xl font-bold text-purple-400">{pack.price}</div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-white">{pack.credits}</div>
                      <div className="text-gray-400">Credits</div>
                    </div>
                    <div className="mb-6">
                      <div className="text-lg font-semibold text-purple-400">+{pack.xp} XP</div>
                      <div className="text-gray-400 text-sm">Instant boost</div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Buy Now – Instant XP Boost!
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-300 text-lg">Everything you need to know about AGTE v3.0</p>
          </div>

          <div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-gray-800/50 border-gray-700 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-purple-400">
                  What's the difference between XP and Credits?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Credits are consumed when you use features (2 credits per feature). XP is earned from credits and
                  actions, building toward levels and badges. Credits reset monthly with your plan, but XP and levels
                  are permanent.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-gray-800/50 border-gray-700 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-purple-400">Can I lose XP?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  No! XP, levels, and badges are permanent achievements. Once earned, they stay with your account
                  forever. Only credits reset monthly based on your subscription plan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-gray-800/50 border-gray-700 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-purple-400">
                  How do Prestige discounts work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Prestige discounts apply to all future subscription renewals for life. Silver gives 10% off, Gold
                  gives 20% off, and Diamond gives 50% off. These stack with any promotional offers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-gray-800/50 border-gray-700 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-purple-400">
                  Do businesses have their own tokenomics?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Yes! Business accounts have separate XP tracking for team activities, company-wide badges, and bulk
                  prestige benefits.{" "}
                  <Link href="/business" className="text-purple-400 hover:text-purple-300 ml-1">
                    Learn more about business tokenomics →
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Join Now
            </span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
