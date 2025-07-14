"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { TierEnforcement, type UserTier } from "@/lib/global-logic"

interface UserTierGateProps {
  userTier: UserTier
  requiredTier: UserTier
  children: ReactNode
  fallback?: ReactNode
  showPreview?: boolean
  featureName?: string
}

export function UserTierGate({
  userTier,
  requiredTier,
  children,
  fallback,
  showPreview = true,
  featureName = "this feature",
}: UserTierGateProps) {
  const hasAccess = TierEnforcement.hasAccess(userTier, requiredTier)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showPreview) {
    return null
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Upgrade Required</h3>
          <p className="text-gray-300 mb-4">
            Unlock {featureName} with {requiredTier.replace("_", " ")} tier
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Link href={TierEnforcement.getUpgradeUrl(requiredTier)}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">{children}</div>
    </Card>
  )
}
