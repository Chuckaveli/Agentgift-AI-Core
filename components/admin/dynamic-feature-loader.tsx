"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { FeatureTile } from "@/components/global/feature-tile"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface DynamicFeature {
  id: string
  slug: string
  name: string
  description: string
  credit_cost: number
  xp_award: number
  tier_access: string[]
  ui_type: string
  is_active: boolean
  show_locked_preview: boolean
  show_on_homepage: boolean
  hide_from_free_tier: boolean
}

interface DynamicFeatureLoaderProps {
  userTier: UserTier
  showHomepageOnly?: boolean
  showInactiveFeatures?: boolean
}

export function DynamicFeatureLoader({
  userTier,
  showHomepageOnly = false,
  showInactiveFeatures = false,
}: DynamicFeatureLoaderProps) {
  const [features, setFeatures] = useState<DynamicFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDynamicFeatures()
  }, [])

  const fetchDynamicFeatures = async () => {
    try {
      const response = await fetch("/api/features/dynamic")
      const data = await response.json()
      setFeatures(data.features || [])
    } catch (error) {
      console.error("Failed to load dynamic features:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFeatures = features.filter((feature) => {
    // Filter by active status
    if (!showInactiveFeatures && !feature.is_active) return false

    // Filter by homepage setting
    if (showHomepageOnly && !feature.show_on_homepage) return false

    // Filter by tier access
    if (feature.hide_from_free_tier && userTier === TIERS.FREE_AGENT) return false

    return true
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredFeatures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          {showHomepageOnly ? "No featured tools available" : "No dynamic features available yet"}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFeatures.map((feature) => {
        const hasAccess = feature.tier_access.some(
          (tier) =>
            TIERS[tier.toUpperCase() as keyof typeof TIERS] === userTier ||
            Object.values(TIERS).indexOf(userTier) >=
              Object.values(TIERS).indexOf(TIERS[tier.toUpperCase() as keyof typeof TIERS]),
        )

        return (
          <UserTierGate
            key={feature.id}
            userTier={userTier}
            requiredTier={feature.tier_access[0] as UserTier}
            showPreview={feature.show_locked_preview}
            featureName={feature.name}
          >
            <FeatureTile
              title={feature.name}
              description={feature.description}
              href={`/features/${feature.slug}`}
              userTier={userTier}
              requiredTier={feature.tier_access[0] as UserTier}
              gradient="from-purple-500 to-pink-500"
              icon={<div className="text-2xl">🎯</div>}
            />
          </UserTierGate>
        )
      })}
    </div>
  )
}
