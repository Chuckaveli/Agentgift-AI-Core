"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Lock, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ComingSoonAnimation from "./coming-soon-animation"

interface LockedFeatureAnimationProps {
  featureName: string
  description?: string
  isComingSoon?: boolean
  isPro?: boolean
  className?: string
  onUpgrade?: () => void
}

export default function LockedFeatureAnimation({
  featureName,
  description,
  isComingSoon = false,
  isPro = false,
  className = "",
  onUpgrade,
}: LockedFeatureAnimationProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (isComingSoon) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <ComingSoonAnimation className="h-64 w-full" featureName={featureName} showUpgradeText={false} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        isHovered ? "scale-105 shadow-lg" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-8 text-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />

        {/* Lock Icon with Animation */}
        <div className="relative mb-6">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 transition-transform duration-300 ${
              isHovered ? "scale-110 rotate-12" : ""
            }`}
          >
            {isPro ? <Crown className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
          </div>

          {/* Sparkles Animation */}
          {isHovered && (
            <>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-purple-400 animate-pulse delay-150" />
              <Sparkles className="absolute top-1/2 -right-4 w-5 h-5 text-pink-400 animate-pulse delay-300" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {featureName}
          </h3>

          {description && <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>}

          <div className="space-y-3">
            {isPro ? (
              <>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-600 font-medium">
                  <Crown className="w-4 h-4" />
                  <span>Pro Feature</span>
                </div>
                <Button
                  onClick={onUpgrade}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Upgrade to Pro
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-sm text-orange-600 font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Coming Soon</span>
                </div>
                <Button variant="outline" disabled className="border-dashed bg-transparent">
                  Feature in Development
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Animated Border */}
        <div
          className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

