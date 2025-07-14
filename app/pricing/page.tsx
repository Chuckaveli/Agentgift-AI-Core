"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, X, Zap, Crown, Shield, Sparkles, Building2, Gift, Moon, Sun, ArrowRight, Star } from "lucide-react"
import Link from "next/link"

const pricingTiers = [
  {
    id: "free",
    name: "Free Agent",
    icon: Gift,
    description: "Perfect for casual gift-givers starting their mission",
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: null,
    color: "from-gray-400 to-gray-600",
    features: [
      "5 AI gift recommendations per month",
      "Basic personality analysis",
      "Email support",
      "Gift history tracking",
      "Mobile app access",
    ],
    limitations: ["Advanced AI insights", "Priority support", "Custom gift categories", "Team collaboration"],
  },
  {
    id: "premium",
    name: "Premium Spy",
    icon: Sparkles,
    description: "For dedicated agents who need more intel",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    badge: null,
    color: "from-blue-400 to-blue-600",
    features: [
      "50 AI gift recommendations per month",
      "Advanced personality insights",
      "Priority email support",
      "Gift wishlist creation",
      "Social media integration",
      "Occasion reminders",
    ],
    limitations: ["Team collaboration", "Custom branding", "API access", "Advanced analytics"],
  },
  {
    id: "pro",
    name: "Pro Agent",
    icon: Zap,
    description: "Most popular choice for serious gift operatives",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    badge: "Most Popular",
    color: "from-purple-400 to-pink-600",
    features: [
      "Unlimited AI recommendations",
      "Deep personality profiling",
      "24/7 priority support",
      "Custom gift categories",
      "Advanced occasion tracking",
      "Gift budget optimization",
      "Sentiment analysis",
    ],
    limitations: ["Team collaboration (5+ users)", "White-label solutions", "Custom integrations"],
  },
  {
    id: "agent00g",
    name: "Agent 00G",
    icon: Crown,
    description: "Elite tier for gift-giving legends",
    monthlyPrice: 39.99,
    yearlyPrice: 399.99,
    badge: "Premium",
    color: "from-yellow-400 to-orange-600",
    features: [
      "Everything in Pro Agent",
      "Personal gift concierge",
      "Custom AI training",
      "VIP customer success manager",
      "Early access to new features",
      "Gift delivery coordination",
      "Exclusive gift partnerships",
    ],
    limitations: ["Enterprise-level security", "Custom contracts", "Dedicated infrastructure"],
  },
  {
    id: "business",
    name: "Small Business",
    icon: Building2,
    description: "Perfect for teams and small organizations",
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    badge: "Team Favorite",
    color: "from-green-400 to-emerald-600",
    features: [
      "Everything in Agent 00G",
      "Team collaboration (up to 25 users)",
      "Bulk gift management",
      "Custom branding",
      "Analytics dashboard",
      "API access",
      "SSO integration",
    ],
    limitations: ["Enterprise security features", "Custom SLA", "Dedicated support team"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Shield,
    description: "For large organizations with complex needs",
    monthlyPrice: null,
    yearlyPrice: null,
    badge: "Custom",
    color: "from-indigo-400 to-purple-600",
    features: [
      "Everything in Small Business",
      "Unlimited users",
      "Custom integrations",
      "Dedicated support team",
      "Custom SLA",
      "Advanced security & compliance",
      "On-premise deployment options",
    ],
    limitations: [],
  },
]

const comparisonFeatures = [
  {
    name: "AI Recommendations per month",
    free: "5",
    premium: "50",
    pro: "Unlimited",
    agent00g: "Unlimited",
    business: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    name: "Personality Analysis",
    free: "Basic",
    premium: "Advanced",
    pro: "Deep",
    agent00g: "Custom",
    business: "Custom",
    enterprise: "Custom",
  },
  {
    name: "Support Level",
    free: "Email",
    premium: "Priority Email",
    pro: "24/7 Priority",
    agent00g: "VIP Manager",
    business: "Dedicated Team",
    enterprise: "Custom SLA",
  },
  { name: "Team Users", free: "1", premium: "1", pro: "1", agent00g: "1", business: "25", enterprise: "Unlimited" },
  { name: "API Access", free: false, premium: false, pro: false, agent00g: false, business: true, enterprise: true },
  {
    name: "Custom Branding",
    free: false,
    premium: false,
    pro: false,
    agent00g: false,
    business: true,
    enterprise: true,
  },
  {
    name: "SSO Integration",
    free: false,
    premium: false,
    pro: false,
    agent00g: false,
    business: true,
    enterprise: true,
  },
  {
    name: "Analytics Dashboard",
    free: false,
    premium: false,
    pro: false,
    agent00g: false,
    business: true,
    enterprise: true,
  },
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
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-lg px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Choose Your Agent Level
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold">
            Upgrade Your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gift Game
            </span>
          </h1>

          <p className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"} max-w-2xl mx-auto`}>
            From casual gift-giver to elite operative - find the perfect plan to match your gifting ambitions. Every
            agent deserves the right tools for their mission! 🎯
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
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
                            : tier.badge === "Team Favorite"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
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
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-2`}>
                      {tier.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-4xl font-bold">
                      {getPrice(tier)}
                      {tier.monthlyPrice !== null && tier.monthlyPrice > 0 && (
                        <span className={`text-lg font-normal ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {getPeriod()}
                        </span>
                      )}
                    </div>
                    {isYearly && savings && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Save {savings}%</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                      </div>
                    ))}

                    {tier.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start space-x-3 opacity-50">
                        <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
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
                    } group/btn`}
                    size="lg"
                  >
                    {tier.id === "free"
                      ? "Start Free Mission"
                      : tier.id === "enterprise"
                        ? "Contact Sales"
                        : "Upgrade to Agent"}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
            Compare all features across our agent tiers to find your perfect match
          </p>
        </div>

        <div className={`overflow-x-auto rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
          <table className="w-full">
            <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <tr>
                <th className="text-left p-4 font-semibold">Features</th>
                {pricingTiers.map((tier) => (
                  <th key={tier.id} className="text-center p-4 font-semibold min-w-32">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={index} className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <td className="p-4 font-medium">{feature.name}</td>
                  <td className="text-center p-4">
                    {typeof feature.free === "boolean" ? (
                      feature.free ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )
                    ) : (
                      feature.free
                    )}
                  </td>
                  <td className="text-center p-4">
                    {typeof feature.premium === "boolean" ? (
                      feature.premium ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )
                    ) : (
                      feature.premium
                    )}
                  </td>
                  <td className="text-center p-4">
                    {typeof feature.pro === "boolean" ? (
                      feature.pro ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )
                    ) : (
                      feature.pro
                    )}
                  </td>
                  <td className="text-center p-4">
                    {typeof feature.agent00g === "boolean" ? (
                      feature.agent00g ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )
                    ) : (
                      feature.agent00g
                    )}
                  </td>
                  <td className="text-center p-4">
                    {typeof feature.business === "boolean" ? (
                      feature.business ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )
                    ) : (
                      feature.business
                    )}
                  </td>
                  <td className="text-center p-4">
                    {typeof feature.enterprise === "boolean" ? (
                      feature.enterprise ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )
                    ) : (
                      feature.enterprise
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6 text-left">
            <div className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                You can upgrade or downgrade your agent level at any time. Changes take effect immediately, and we'll
                prorate any billing differences.
              </p>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <h3 className="font-semibold mb-2">What happens if I exceed my recommendation limit?</h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Don't worry! We'll notify you when you're approaching your limit. You can either upgrade your plan or
                wait for your monthly reset - no gifts left behind! 🎁
              </p>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <h3 className="font-semibold mb-2">Is there a free trial for paid plans?</h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Yes! All paid plans come with a 14-day free trial. No credit card required for the Free Agent tier, and
                you can cancel anytime during your trial period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Level Up Your Gift Game? 🚀</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of agents who've mastered the art of perfect gift-giving with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Free Mission
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              Talk to Sales
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
