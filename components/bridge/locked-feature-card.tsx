"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown, Zap, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface LockedFeatureCardProps {
  title: string
  description: string
  tier: "PRO" | "PRO+" | "ENTERPRISE"
  icon?: LucideIcon
  className?: string
  showUpgradeButton?: boolean
}

export function LockedFeatureCard({
  title,
  description,
  tier,
  icon: Icon = Lock,
  className,
  showUpgradeButton = true,
}: LockedFeatureCardProps) {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "PRO":
        return {
          color: "purple",
          icon: Crown,
          gradient: "from-purple-500 to-purple-600",
          bgGradient: "from-purple-50 to-purple-100",
          borderColor: "border-purple-200",
          textColor: "text-purple-700",
        }
      case "PRO+":
        return {
          color: "pink",
          icon: Zap,
          gradient: "from-pink-500 to-pink-600",
          bgGradient: "from-pink-50 to-pink-100",
          borderColor: "border-pink-200",
          textColor: "text-pink-700",
        }
      case "ENTERPRISE":
        return {
          color: "indigo",
          icon: Star,
          gradient: "from-indigo-500 to-indigo-600",
          bgGradient: "from-indigo-50 to-indigo-100",
          borderColor: "border-indigo-200",
          textColor: "text-indigo-700",
        }
      default:
        return {
          color: "gray",
          icon: Lock,
          gradient: "from-gray-500 to-gray-600",
          bgGradient: "from-gray-50 to-gray-100",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
        }
    }
  }

  const config = getTierConfig(tier)
  const TierIcon = config.icon

  return (
    <Card
      className={cn(
        "relative overflow-hidden group cursor-not-allowed",
        "transition-all duration-300 hover:shadow-lg",
        config.borderColor,
        className,
      )}
    >
      {/* Locked overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 z-10", config.bgGradient)} />

      {/* Blur effect for content behind */}
      <div className="absolute inset-0 backdrop-blur-[2px] z-20" />

      {/* Lock icon overlay */}
      <div className="absolute top-4 right-4 z-30">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-gradient-to-r text-white shadow-lg",
            config.gradient,
          )}
        >
          <Lock className="w-4 h-4" />
        </div>
      </div>

      {/* Tier badge */}
      <div className="absolute top-4 left-4 z-30">
        <Badge className={cn("bg-white/90 backdrop-blur-sm border", config.borderColor, config.textColor)}>
          <TierIcon className="w-3 h-3 mr-1" />
          {tier}
        </Badge>
      </div>

      <CardContent className="relative z-30 p-6 text-center space-y-4">
        {/* Feature icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-lg mx-auto flex items-center justify-center",
            "bg-gradient-to-r text-white shadow-lg",
            config.gradient,
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Feature info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Unlock message */}
        <div className="space-y-3">
          <p className={cn("text-sm font-medium", config.textColor)}>Unlock with {tier}</p>

          {showUpgradeButton && (
            <Button
              size="sm"
              className={cn(
                "bg-gradient-to-r text-white hover:shadow-lg",
                "transform hover:scale-105 transition-all duration-200",
                config.gradient,
              )}
              asChild
            >
              <Link href="/pricing">
                <TierIcon className="w-4 h-4 mr-2" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>

      {/* Sparkle animation on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-25 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping animation-delay-300" />
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-white rounded-full animate-ping animation-delay-600" />
      </div>
    </Card>
  )
}
