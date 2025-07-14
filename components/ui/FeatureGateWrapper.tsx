"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { checkUserAccess, type AccessCheckResult } from "@/lib/helpers/checkUserAccess"
import { OutOfCreditsModal } from "./OutOfCreditsModal"
import { UpgradeCTA } from "./UpgradeCTA"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeatureGateWrapperProps {
  featureName: string
  children: React.ReactNode
  showLockedPreview?: boolean
  previewContent?: React.ReactNode
  className?: string
}

export function FeatureGateWrapper({
  featureName,
  children,
  showLockedPreview = true,
  previewContent,
  className = "",
}: FeatureGateWrapperProps) {
  const [accessResult, setAccessResult] = useState<AccessCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await checkUserAccess(featureName)
        setAccessResult(result)

        // Get user profile for modal
        if (!result.accessGranted && result.fallbackReason === "insufficient_credits") {
          // Fetch user profile for XP/level info
          const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs")
          const supabase = createClientComponentClient()

          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("xp, level, credits")
              .eq("id", session.user.id)
              .single()

            setUserProfile(profile)
          }
        }
      } catch (error) {
        console.error("Access check failed:", error)
        toast({
          title: "Error",
          description: "Failed to check feature access. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [featureName, toast])

  // Show loading state
  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Checking access...</p>
        </CardContent>
      </Card>
    )
  }

  // Show access granted - render children
  if (accessResult?.accessGranted) {
    return <>{children}</>
  }

  // Handle different access denial reasons
  if (accessResult) {
    // No authentication
    if (accessResult.fallbackReason === "no_auth") {
      return (
        <Card className={`border-2 border-dashed border-gray-300 ${className}`}>
          <CardContent className="p-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">Please sign in to access this feature.</p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign In
            </button>
          </CardContent>
        </Card>
      )
    }

    // Insufficient tier
    if (accessResult.fallbackReason === "insufficient_tier") {
      if (showLockedPreview && previewContent) {
        return (
          <div className={`relative ${className}`}>
            <div className="relative">
              {previewContent}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <UpgradeCTA
                  currentTier={accessResult.currentTier || "free_agent"}
                  requiredTier={accessResult.requiredTier || "premium_spy"}
                  featureName={featureName}
                  variant="card"
                />
              </div>
            </div>
          </div>
        )
      }

      return (
        <UpgradeCTA
          currentTier={accessResult.currentTier || "free_agent"}
          requiredTier={accessResult.requiredTier || "premium_spy"}
          featureName={featureName}
          variant="card"
          className={className}
        />
      )
    }

    // Insufficient credits
    if (accessResult.fallbackReason === "insufficient_credits") {
      return (
        <>
          <Card className={`border-2 border-dashed border-orange-300 bg-orange-50 ${className}`}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Credits Required</h3>
              <p className="text-gray-600 mb-4">
                You need {accessResult.creditsNeeded} credits to use this feature.
                <br />
                You currently have {accessResult.creditsLeft} credits.
              </p>
              <button
                onClick={() => setShowCreditsModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Get More Credits
              </button>
            </CardContent>
          </Card>

          <OutOfCreditsModal
            isOpen={showCreditsModal}
            onClose={() => setShowCreditsModal(false)}
            userXP={userProfile?.xp || 0}
            userLevel={userProfile?.level || 1}
            creditsNeeded={accessResult.creditsNeeded || 1}
          />
        </>
      )
    }

    // Feature disabled
    if (accessResult.fallbackReason === "feature_disabled") {
      return (
        <Card className={`border-2 border-dashed border-gray-300 ${className}`}>
          <CardContent className="p-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Feature Unavailable</h3>
            <p className="text-gray-600">This feature is currently disabled or under maintenance.</p>
          </CardContent>
        </Card>
      )
    }
  }

  // Fallback error state
  return (
    <Card className={`border-2 border-dashed border-red-300 bg-red-50 ${className}`}>
      <CardContent className="p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold mb-2">Access Error</h3>
        <p className="text-gray-600">Unable to verify access to this feature. Please try again.</p>
      </CardContent>
    </Card>
  )
}
