"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Zap, Crown } from "lucide-react"
import { getCurrentUser, checkFeatureAccess, FEATURE_ACCESS, type FeatureKey, type User } from "@/lib/feature-access"

interface FeatureUsageIndicatorProps {
  feature: FeatureKey
  className?: string
}

export function FeatureUsageIndicator({ feature, className = "" }: FeatureUsageIndicatorProps) {
  const [user, setUser] = useState<User | null>(null)
  const [usageData, setUsageData] = useState<{
    current: number
    limit: number
    percentage: number
  } | null>(null)

  useEffect(() => {
    loadUsageData()
  }, [feature])

  const loadUsageData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser) return

      const featureConfig = FEATURE_ACCESS[feature]
      if (!featureConfig.usageLimit) return

      const accessResult = checkFeatureAccess(
        currentUser.tier,
        feature,
        currentUser.trial_features_used,
        currentUser.feature_usage,
      )

      const currentUsage = currentUser.feature_usage[feature] || 0
      const limit = featureConfig.usageLimit
      const percentage = (currentUsage / limit) * 100

      setUsageData({
        current: currentUsage,
        limit,
        percentage,
      })
    } catch (error) {
      console.error("Error loading usage data:", error)
    }
  }

  if (!usageData || !user) return null

  const isNearLimit = usageData.percentage >= 80
  const isAtLimit = usageData.percentage >= 100

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Usage this month</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${isAtLimit ? "text-red-600" : isNearLimit ? "text-orange-600" : "text-gray-900 dark:text-gray-100"}`}
                >
                  {usageData.current}/{usageData.limit}
                </span>
                {isNearLimit && (
                  <AlertTriangle className={`w-4 h-4 ${isAtLimit ? "text-red-500" : "text-orange-500"}`} />
                )}
              </div>
            </div>

            <Progress
              value={usageData.percentage}
              className="h-2"
              indicatorClassName={isAtLimit ? "bg-red-500" : isNearLimit ? "bg-orange-500" : "bg-green-500"}
            />

            {isAtLimit && (
              <Badge variant="destructive" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Upgrade to continue
              </Badge>
            )}

            {isNearLimit && !isAtLimit && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                <Zap className="w-3 h-3 mr-1" />
                Almost at limit
              </Badge>
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">Feature Usage</p>
            <p className="text-sm text-gray-600">
              {usageData.current} of {usageData.limit} uses this month
            </p>
            {isAtLimit && <p className="text-sm text-red-600 mt-1">Upgrade to unlock unlimited usage</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

