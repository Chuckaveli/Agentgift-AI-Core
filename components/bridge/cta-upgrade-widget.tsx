"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Sparkles, Zap, Star, ArrowRight, Gift, Users, Heart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface CTAUpgradeProps {
  currentTier: string
  className?: string
}

export function CTAUpgradeWidget({ currentTier, className }: CTAUpgradeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)

  const tierConfig = {
    FREE: {
      nextTier: "PRO",
      icon: Crown,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      features: [
        { icon: Gift, text: "Unlimited Agent Gifty™ drops" },
        { icon: Sparkles, text: "Advanced Gift Gut Check™" },
        { icon: Heart, text: "Save & organize gift ideas" },
        { icon: Users, text: "Voice interactions with AI" },
      ],
      savings: "Save 40% with annual billing",
      price: "$9.99/month",
    },
    PRO: {
      nextTier: "PRO+",
      icon: Zap,
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      features: [
        { icon: Heart, text: "Emotion Tag Gifting™" },
        { icon: Users, text: "Group gifting campaigns" },
        { icon: Sparkles, text: "Priority AI processing" },
        { icon: Star, text: "Advanced cultural insights" },
      ],
      savings: "Most popular upgrade",
      price: "$19.99/month",
    },
    "PRO+": {
      nextTier: "ENTERPRISE",
      icon: Star,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      features: [
        { icon: Star, text: "Cultural Respect Engine™" },
        { icon: Gift, text: "White-label solutions" },
        { icon: Zap, text: "API access & integrations" },
        { icon: Crown, text: "Dedicated support team" },
      ],
      savings: "Custom pricing available",
      price: "Contact Sales",
    },
  }

  const config = tierConfig[currentTier as keyof typeof tierConfig]

  useEffect(() => {
    setIsVisible(true)

    // Rotate through features
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % config.features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [config.features.length])

  if (!config || currentTier === "ENTERPRISE") {
    return null
  }

  const TierIcon = config.icon
  const currentFeature = config.features[currentFeatureIndex]
  const FeatureIcon = currentFeature.icon

  return (
    <Card className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Animated background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-5 ${config.bgGradient} transition-opacity duration-500 group-hover:opacity-10`}
      />

      {/* Sparkle effects */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <CardContent className="relative p-6 text-center space-y-4">
        {/* Tier Badge */}
        <div className="flex justify-center">
          <Badge className={`bg-gradient-to-r text-white border-0 px-3 py-1 ${config.gradient}`}>
            <TierIcon className="w-4 h-4 mr-2" />
            Upgrade to {config.nextTier}
          </Badge>
        </div>

        {/* Rotating Feature Highlight */}
        <div className="space-y-3">
          <div
            className={`transition-all duration-500 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
            key={currentFeatureIndex}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FeatureIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">{currentFeature.text}</span>
            </div>
          </div>

          {/* Feature dots indicator */}
          <div className="flex justify-center space-x-1">
            {config.features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFeatureIndex ? `bg-gradient-to-r ${config.gradient}` : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">{config.price}</p>
          <p className="text-sm text-gray-600">{config.savings}</p>
        </div>

        {/* CTA Button */}
        <Button
          className={`w-full bg-gradient-to-r text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${config.gradient}`}
          asChild
        >
          <Link href="/pricing">
            <TierIcon className="w-4 h-4 mr-2" />
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </Button>

        {/* Trust indicator */}
        <p className="text-xs text-gray-500">✨ 30-day money-back guarantee • Cancel anytime</p>
      </CardContent>
    </Card>
  )
}

