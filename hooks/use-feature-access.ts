"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getCurrentUser,
  checkFeatureAccess,
  recordFeatureUsage,
  canTryFeatureOnce,
  type FeatureKey,
  type User,
  type FeatureAccessResult,
} from "@/lib/feature-access"

export function useFeatureAccess(feature: FeatureKey) {
  const [user, setUser] = useState<User | null>(null)
  const [accessResult, setAccessResult] = useState<FeatureAccessResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAccess = useCallback(async () => {
    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser) {
        setAccessResult({ hasAccess: false, reason: "tier_insufficient" })
        return
      }

      const result = checkFeatureAccess(
        currentUser.tier,
        feature,
        currentUser.trial_features_used,
        currentUser.feature_usage,
      )

      setAccessResult(result)
    } catch (error) {
      console.error("Error checking feature access:", error)
      setAccessResult({ hasAccess: false, reason: "tier_insufficient" })
    } finally {
      setIsLoading(false)
    }
  }, [feature])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  const useFeature = useCallback(
    async (isTrial = false) => {
      if (!user) {
        toast.error("Please log in to use this feature")
        return false
      }

      if (!accessResult?.hasAccess && !isTrial) {
        toast.error("You don't have access to this feature")
        return false
      }

      if (isTrial && !accessResult?.canTrial) {
        toast.error("Trial not available for this feature")
        return false
      }

      try {
        await recordFeatureUsage(user.id, feature, isTrial)

        if (isTrial) {
          toast.success("Trial activated!", {
            description: "Enjoy your free preview of this feature.",
          })
        }

        // Refresh access status
        await checkAccess()
        return true
      } catch (error) {
        console.error("Error using feature:", error)
        toast.error("Failed to use feature. Please try again.")
        return false
      }
    },
    [user, accessResult, feature, checkAccess],
  )

  const canTrial = useCallback(() => {
    if (!user) return false
    return canTryFeatureOnce(feature, user.trial_features_used)
  }, [user, feature])

  return {
    user,
    hasAccess: accessResult?.hasAccess || false,
    accessResult,
    isLoading,
    useFeature,
    canTrial: canTrial(),
    refreshAccess: checkAccess,
  }
}
