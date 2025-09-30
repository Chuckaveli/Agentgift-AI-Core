"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, ArrowRight, Sparkles, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradeCTAProps {
  currentTier: string
  requiredTier: string
  featureName: string
  variant?: "banner" | "card" | "inline"
  className?: string
}

const TIER_NAMES = {
  free_agent: "Free Agent",
  premium_spy: "Premium Spy",
  pro_agent: "Pro Agent",
  agent_00g: "Agent 00G",
  small_biz: "Small Business",
  enterprise: "Enterprise",
}

const TIER_COLORS = {
  free_agent: "from-gray-500 to-gray-600",
  premium_spy: "from-blue-500 to-blue-600",
  pro_agent: "from-purple-500 to-purple-600",
  agent_00g: "from-yellow-500 to-orange-500",
  small_biz: "from-green-500 to-green-600",
  enterprise: "from-red-500 to-red-600",
}

export function UpgradeCTA({
  currentTier,
  requiredTier,
  featureName,
  variant = "card",
  className = "",
}: UpgradeCTAProps) {
  const router = useRouter()

  const currentTierName = TIER_NAMES[currentTier as keyof typeof TIER_NAMES] || "Free Agent"
  const requiredTierName = TIER_NAMES[requiredTier as keyof typeof TIER_NAMES] || "Premium"
  const requiredTierColor = TIER_COLORS[requiredTier as keyof typeof TIER_COLORS] || "from-purple-500 to-purple-600"

  const handleUpgrade = () => {
    router.push(`/pricing?tier=${requiredTier}&feature=${featureName}`)
  }

  if (variant === "banner") {
    return (
      <div className={`bg-gradient-to-r ${requiredTierColor} text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                {featureName} - {requiredTierName} Required
              </h3>
              <p className="text-sm opacity-90">You're currently on {currentTierName}</p>
            </div>
          </div>
          <Button
            onClick={handleUpgrade}
            variant="secondary"
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${className}`}>
        <div className="flex items-center space-x-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{requiredTierName} Feature</span>
        </div>
        <Button onClick={handleUpgrade} size="sm" variant="outline">
          Upgrade
        </Button>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={`border-2 border-dashed border-gray-300 ${className}`}>
      <CardContent className="p-6 text-center">
        <div
          className={`mx-auto w-16 h-16 bg-gradient-to-br ${requiredTierColor} rounded-full flex items-center justify-center mb-4`}
        >
          <Crown className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Unlock {featureName}</h3>

        <p className="text-gray-600 mb-4">
          This feature requires <span className="font-semibold">{requiredTierName}</span> access.
          <br />
          You're currently on <span className="font-semibold">{currentTierName}</span>.
        </p>

        <div className="space-y-3">
          <Button onClick={handleUpgrade} className={`w-full bg-gradient-to-r ${requiredTierColor} hover:opacity-90`}>
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to {requiredTierName}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button variant="outline" size="sm" onClick={() => router.push("/pricing")} className="w-full">
            View All Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
