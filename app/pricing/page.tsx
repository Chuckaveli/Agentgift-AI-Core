"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  Star,
  Gift,
  Heart,
  Users,
  Shield,
  Plus,
  ChevronRight,
  Trophy,
  Target,
  Gem,
  Rocket,
} from "lucide-react"
import Link from "next/link"

const tiers = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started with gift discovery",
    icon: Gift,
    color: "from-gray-500 to-gray-600",
    popular: false,
    features: [
      "5 AI gift suggestions per month",
      "Basic emotional filters",
      "Gift gut check (3 uses/month)",
      "Community access",
    ],
    limitations: ["Limited filter options", "No premium personas"],
    credits: 50,
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
  },
  {
    name: "Premium",
    price: { monthly: 9.99, yearly: 99.99 },
    description: "Enhanced gifting with emotional intelligence",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    popular: false,
    features: [
      "50 AI suggestions per month",
      "Love vibe filters",
      "Premium personas (Avelyn, Galen)",
      "Gift campaigns",
    ],
    limitations: ["No intent filters", "Limited cultural intelligence"],
    credits: 500,
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
  },
  {
    name: "Pro",
    price: { monthly: 19.99, yearly: 199.99 },
    description: "Professional gifting with advanced AI insights",
    icon: Crown,
    color: "from-purple-500 to-indigo-600",
    popular: true,
    features: [
      "200 AI suggestions per month",
      "Intent & emotion filters",
      "All personas unlocked",
      "Cultural intelligence",
    ],
    limitations: ["No hidden depth filters", "Standard priority support"],
    credits: 2000,
    buttonText: "Go Pro",
    buttonVariant: "default" as const,
  },
  {
    name: "Pro+",
    price: { monthly: 39.99, yearly: 399.99 },
    description: "Ultimate gifting mastery with exclusive features",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    popular: false,
    features: ["Unlimited AI suggestions", "Hidden depth filters", "Agent 00G persona", "Priority support"],
    limitations: [],
    credits: "Unlimited" as const,
    buttonText: "Master Gifting",
    buttonVariant: "default" as const,
  },
  {
    name: "Agent 00G",
    price: { monthly: 99.99, yearly: 999.99 },
    description: "Elite gifting intelligence for professionals",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    popular: false,
    features: ["Everything in Pro+", "White-label solutions", "API access", "Custom integrations"],
    limitations: [],
    credits: "Unlimited" as const,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
]

const creditActions = [
  { name: "AI Gift Suggestion", cost: 10, icon: Sparkles },
  { name: "Emotional Analysis", cost: 5, icon: Heart },
  { name: "Cultural Intelligence", cost: 15, icon: Users },
  { name: "Gift Gut Check", cost: 8, icon: Target },
  { name: "Persona Consultation", cost: 12, icon: Crown },
  { name: "Campaign Creation", cost: 25, icon: Rocket },
]

const addOns = [
  {
    name: "Extra Credits Pack",
    description: "500 additional credits",
    price: 4.99,
    icon: Plus,
  },
  {
    name: "Priority Support",
    description: "24/7 premium support",
    price: 9.99,
    icon: Shield,
  },
  {
    name: "Custom Personas",
    description: "Create your own AI persona",
    price: 19.99,
    icon: Star,
  },
  {
    name: "White Label",
    description: "Remove AgentGift branding",
    price: 49.99,
    icon: Gem,
  },
  {
    name: "API Access",
    description: "Integrate with your systems",
    price: 29.99,
    icon: Zap,
  },
  {
    name: "Team Collaboration",
    description: "Share gifts with your team",
    price: 14.99,
    icon: Users,
  },
  {
    name: "Advanced Analytics",
    description: "Deep insights and reporting",
    price: 24.99,
    icon: Trophy,
  },
  {
    name: "Custom Integrations",
    description: "Connect to your favorite tools",
    price: 99.99,
    icon: Rocket,
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md flex items-center justify-center">
                  <Gift className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift.ai
                </span>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Premium Plans
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Choose Your Gifting Superpower
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Unlock the perfect gift for every occasion with AI-powered emotional intelligence and cultural awareness.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-purple-600" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? "text-purple-600" : "text-gray-500"}`}>
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                Save 17%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const price = isYearly ? tier.price.yearly : tier.price.monthly
            const savings = isYearly ? (tier.price.monthly * 12 - tier.price.yearly).toFixed(2) : null

            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  tier.popular ? "ring-2 ring-purple-500 shadow-lg" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-1">
                    <span className="text-xs font-semibold">Most Popular</span>
                  </div>
                )}

                <CardHeader className={`pb-4 ${tier.popular ? "pt-8" : "pt-6"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${tier.color} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {tier.credits !== "Unlimited" && (
                      <Badge variant="outline" className="text-xs">
                        {tier.credits} credits
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">${price}</span>
                      <span className="text-sm text-gray-500 ml-1">/{isYearly ? "year" : "month"}</span>
                    </div>
                    {savings && <p className="text-xs text-green-600">Save ${savings}/year</p>}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{tier.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {tier.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {tier.limitations.slice(0, 2).map((limitation) => (
                      <div key={limitation} className="flex items-start gap-2">
                        <X className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full text-xs ${
                      tier.buttonVariant === "outline"
                        ? "border-gray-300 hover:bg-gray-50"
                        : `bg-gradient-to-r ${tier.color} hover:opacity-90`
                    }`}
                    variant={tier.buttonVariant}
                  >
                    {tier.buttonText}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Credit System */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">How Credits Work</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Every action costs credits. Choose a plan that fits your gifting needs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {creditActions.map((action) => {
              const Icon = action.icon
              return (
                <Card key={action.name} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs mb-1">{action.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {action.cost} credits
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Power-ups & Add-ons</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Enhance your plan with additional features and capabilities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {addOns.map((addon) => {
              const Icon = addon.icon
              return (
                <Card key={addon.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-semibold text-sm">{addon.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{addon.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">${addon.price}</span>
                      <Button size="sm" variant="outline" className="text-xs bg-transparent">
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Gamification */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                XP & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Earn XP for every gift suggestion, unlock achievements, and level up your gifting skills.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Level 5 Gift Master</span>
                  <span>2,450 / 3,000 XP</span>
                </div>
                <Progress value={81} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Community & Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Share your best gift ideas, get feedback from the community, and discover trending gifts.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Join Community
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">We're here to help you find the perfect gifting plan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

