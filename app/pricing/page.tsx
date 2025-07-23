"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, X, Zap, Crown, Shield, Sparkles, Building2, Gift, Moon, Sun, ArrowRight, Star, Coins, Trophy, Target, Brain, Mic, MessageSquare, Heart } from 'lucide-react'
import Link from "next/link"

const pricingTiers = [
  {
    id: "free",
    name: "Free Agent",
    icon: Gift,
    description: "Just getting started or testing us out",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 2,
    badge: null,
    color: "from-gray-400 to-gray-600",
    features: [
      "2 credits per month",
      "AI Gift Suggestions",
      "Basic voice input",
      "Mobile app access",
      "XP tracking",
    ],
    limitations: ["Agent Concierge access", "Advanced rituals", "LUMIENCE™ sessions", "Credit rollover"],
  },
  {
    id: "premium",
    name: "Premium Spy",
    icon: Sparkles,
    description: "Light gifter, casual occasions",
    monthlyPrice: 3.99,
    yearlyPrice: 39.99,
    credits: 12,
    badge: null,
    color: "from-blue-400 to-blue-600",
    features: [
      "12 credits per month",
      "Credits roll over 1 month",
      "Text-to-speech messages",
      "Voice input (1 credit/min)",
      "Agent Gifty™ access",
      "XP multiplier: 1.2x",
    ],
    limitations: ["Agent Concierge (limited)", "Advanced rituals", "LUMIENCE™ sessions", "Prestige levels"],
  },
  {
    id: "pro",
    name: "Pro Agent",
    icon: Zap,
    description: "Active users, couples, gift pros",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    credits: 60,
    badge: "Most Popular",
    color: "from-purple-400 to-pink-600",
    features: [
      "60 credits per month",
      "Credits roll over 1 month",
      "Agent Concierge (GPT-4o)",
      "Advanced Ritual Generator",
      "LUMIENCE™ Mood Mirror",
      "XP multiplier: 1.5x",
      "Priority support",
    ],
    limitations: ["Unlimited concierge", "Prestige levels", "Custom AI voice", "Mentor role"],
  },
  {
    id: "agent00g",
    name: "Agent 00G (Pro+)",
    icon: Crown,
    description: "Power gifters, concierge access, full unlock",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    credits: 200,
    badge: "Premium",
    color: "from-yellow-400 to-orange-600",
    features: [
      "200 credits per month",
      "Credits roll over 1 month",
      "Unlimited Agent Concierge",
      "All premium features unlocked",
      "Custom gifting identity",
      "XP multiplier: 2x",
      "VIP customer success",
      "Early access to features",
    ],
    limitations: ["Enterprise security", "Custom contracts", "Unlimited users"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    description: "HR teams, culture leaders, brand partners",
    monthlyPrice: null,
    yearlyPrice: null,
    credits: "Unlimited",
    badge: "Custom",
    color: "from-indigo-400 to-purple-600",
    features: [
      "Unlimited or tiered credits",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support team",
      "Custom SLA",
      "Advanced analytics",
      "White-label options",
    ],
    limitations: [],
  },
]

const creditActions = [
  { action: "AI Gift Suggestion", cost: 1, icon: Gift },
  { action: "Text-to-Speech Message", cost: 1, icon: MessageSquare },
  { action: "Voice Input (per minute)", cost: 1, icon: Mic },
  { action: "Agent Concierge (GPT-4o)", cost: "5-10", icon: Brain },
  { action: "Agent Gifty™ (voice/video)", cost: "2-5", icon: Heart },
  { action: "Advanced Ritual Generator", cost: "3-7", icon: Sparkles },
  { action: "LUMIENCE™ Mood Mirror", cost: "3-5", icon: Target },
]

const creditAddOns = [
  { name: "Quick Boost", price: 5, credits: 50 },
  { name: "Momentum Pack", price: 10, credits: 125 },
  { name: "Power Pack", price: 25, credits: 400 },
  { name: "Gifter's Vault", price: 50, credits: 1000 },
]

const prestigeLevels = [
  { level: "🥈 1", unlock: "10% off annual plans" },
  { level: "🥇 2", unlock: "20% off annual plans" },
  { level: "💎 3", unlock: "50% off for life (revocable)" },
  { level: "🧬 4", unlock: "Custom Gifting Identity - AI voice tone + gift style unlock" },
  { level: "🫶 5", unlock: "Mentor Role - Earn credits reviewing gifts, join gifting guilds" },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const getPrice = (tier: (typeof pricingTiers)[0]) => {
    if (tier.monthlyPrice === null) return "Custom"
    if (tier.monthlyPrice === 0) return "Free"

    const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice
    return `$${price}`
  }

  const getPeriod = () => {
    return isYearly ? "/year" : "/month"
  }

  const getSavings = (tier: (typeof pricingTiers)[0]) => {
    if (!tier.monthlyPrice || tier.monthlyPrice === 0) return null
    const monthlyCost = tier.monthlyPrice * 12
    const savings = monthlyCost - tier.yearlyPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return percentage
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
      }`}
    >
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost">Back to Dashboard</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-lg px-4 py-2">
            <Coins className="w-4 h-4 mr-2" />
            Welcome to the Creditverse™
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold">
            💸 Pricing That Grows With Your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gifting Power
            </span>
          </h1>

          <p className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
            Welcome to the AgentGift.ai Creditverse™ — where every thoughtful action, voice note, or surprise gift is powered by our credit-based economy built for real-world scale.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <span className={`${!isYearly ? "font-semibold" : ""} ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-purple-600" />
            <span className={`${isYearly ? "font-semibold" : ""} ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Yearly
            </span>
            {isYearly && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Save up to 20%!</Badge>}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white/60"} backdrop-blur`}>
              <div className="text-2xl mb-2">🌀</div>
              <p className="text-sm">All plans include 1 free trial of premium features before locking</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white/60"} backdrop-blur`}>
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm">Credits roll over 1 month. Use 'em or gift 'em</p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white/60"} backdrop-blur`}>
              <div className="text-2xl mb-2">🧮</div>
              <p className="text-sm">Credit Power = Gifting Power</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🎁 Starter Plans</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const IconComponent = tier.icon
            const savings = getSavings(tier)

            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur border-gray-200"
                } ${tier.badge === "Most Popular" ? "ring-2 ring-purple-500 shadow-purple-500/25" : ""}`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge
                      className={`${
                        tier.badge === "Most Popular"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : tier.badge === "Premium"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                            : "bg-gray-600 text-white"
                      } px-4 py-1 text-sm font-semibold shadow-lg`}
                    >
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                />

                <CardHeader className="text-center space-y-4 pt-8">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
                      {tier.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {getPrice(tier)}
                      {tier.monthlyPrice !== null && tier.monthlyPrice > 0 && (
                        <span className={`text-sm font-normal ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {getPeriod()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Coins className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-purple-600">{tier.credits} credits</span>
                    </div>
                    {isYearly && savings && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Save {savings}%</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                      </div>
                    ))}

                    {tier.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start space-x-2 opacity-50">
                        <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {limitation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      tier.badge === "Most Popular"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        : tier.id === "free"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    } group/btn text-sm`}
                    size="sm"
                  >
                    {tier.id === "free"
                      ? "Start Free"
                      : tier.id === "enterprise"
                        ? "Contact Sales"
                        : "Choose Plan"}
                    <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Credit Actions */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🧮 Credit Power = Gifting Power</h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
            🧠 Credits are consumed per action — not per session. Choose your moves wisely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {creditActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Card key={index} className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur"} hover:shadow-lg transition-all`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.action}</h3>
                  <div className="text-2xl font-bold text-purple-600">{action.cost}</div>
                  <div className="text-sm text-gray-500">credit{action.cost !== 1 && action.cost !== "1" ? "s" : ""}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Gamification */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🏆 Gamify Your Giving</h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
            Every credit spent fuels your XP journey. Here's how it works:
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur"}`}>
              <CardHeader>
                <h3 className="text-xl font-bold flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  XP System
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>2 credits spent</span>
                  <Badge className="bg-purple-100 text-purple-700">1 XP</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Concierge/4o Use</span>
                  <Badge className="bg-purple-100 text-purple-700">10 XP</Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">15,000 XP</div>
                    <div className="text-sm text-gray-500">= Level 100</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur"}`}>
              <CardHeader>
                <h3 className="text-xl font-bold flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Prestige Path
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Reach Level 100? Unlock the Prestige Path</p>
                <div className="space-y-2">
                  {prestigeLevels.map((prestige, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-lg">{prestige.level}</span>
                      <span className="text-sm">{prestige.unlock}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Credit Add-Ons */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🛒 Credit Add-Ons</h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
            Need more credits? Top up anytime with our credit bundles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {creditAddOns.map((addon, index) => (
            <Card key={index} className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur"} hover:shadow-lg transition-all text-center`}>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{addon.name}</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">${addon.price}</div>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <Coins className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold">{addon.credits.toLocaleString()} credits</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Transparency Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur"}`}>
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">👀 Behind the Curtain (For Transparency's Sake)</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">⚖️ Smart Pricing</h3>
                  <p className="text-sm text-gray-600">
                    AgentGift auto-calibrates credit cost vs. infrastructure cost (OpenAI, Supabase, etc.) so your usage is always efficient — and we stay in business. 😎
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📊 Feature Assessment</h3>
                  <p className="text-sm text-gray-600">
                    All features are auto-assessed for ROI, XP balance, and upgrade conversion.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🎯 Trial Strategy</h3>
                  <p className="text-sm text-gray-600">
                    Expensive features are trial-limited with upgrade nudges.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">👑 Founder Override</h3>
                  <p className="text-sm text-gray-600">
                    Founder override is always in place. You call the shots.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to upgrade your gifting game? 🚀</h2>
          <p className="text-xl mb-8 opacity-90">
            Every action is emotional currency. We just made it intelligent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              🪙 Choose Your Plan
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              📈 Track Your XP
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              🎁 Get More Credits
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`container mx-auto px-4 py-12 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </div>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Making gift-giving magical with the power of artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  )
}
