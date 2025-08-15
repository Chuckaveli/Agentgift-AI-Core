"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Lock, Crown, Zap, ArrowRight, Gift } from "lucide-react"
import Link from "next/link"
import {
  getCurrentUser,
  checkFeatureAccess,
  recordFeatureUsage,
  getUpgradeUrl,
  TIER_NAMES,
  type FeatureKey,
  type User,
  type FeatureAccessResult,
} from "@/lib/feature-access"

interface FeatureGateProps {
  feature: FeatureKey
  children: ReactNode
  fallback?: ReactNode
  showUpgradeModal?: boolean
  onAccessDenied?: (result: FeatureAccessResult) => void
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradeModal = true,
  onAccessDenied,
}: FeatureGateProps) {
  const [user, setUser] = useState<User | null>(null)
  const [accessResult, setAccessResult] = useState<FeatureAccessResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTryingFeature, setIsTryingFeature] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [feature])

  const checkAccess = async () => {
    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser) {
        setAccessResult({ hasAccess: false, reason: "tier_insufficient" })
        setIsLoading(false)
        return
      }

      const result = checkFeatureAccess(
        currentUser.tier,
        feature,
        currentUser.trial_features_used,
        currentUser.feature_usage,
      )

      setAccessResult(result)

      if (!result.hasAccess && onAccessDenied) {
        onAccessDenied(result)
      }
    } catch (error) {
      console.error("Error checking feature access:", error)
      setAccessResult({ hasAccess: false, reason: "tier_insufficient" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryFeature = async () => {
    if (!user || !accessResult?.canTrial) return

    setIsTryingFeature(true)
    try {
      await recordFeatureUsage(user.id, feature, true)
      toast.success("Trial activated! Enjoy your free preview.", {
        description: "This feature is now unlocked for this session.",
        duration: 4000,
      })

      // Refresh access check
      await checkAccess()
      setShowModal(false)
    } catch (error) {
      console.error("Error activating trial:", error)
      toast.error("Failed to activate trial. Please try again.")
    } finally {
      setIsTryingFeature(false)
    }
  }

  const handleFeatureClick = () => {
    if (!accessResult?.hasAccess && showUpgradeModal) {
      setShowModal(true)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  // If user has access, render children
  if (accessResult?.hasAccess) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Default locked state
  return (
    <>
      <div className="relative cursor-pointer group" onClick={handleFeatureClick}>
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Premium Feature</h3>
            <p className="text-sm text-gray-300 mb-4">
              {accessResult?.requiredTier && `Upgrade to ${TIER_NAMES[accessResult.requiredTier]} to unlock`}
            </p>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">{children}</div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>This feature requires a higher tier subscription to access.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {accessResult?.requiredTier && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-purple-900">{TIER_NAMES[accessResult.requiredTier]}</h4>
                      <p className="text-sm text-purple-700">Required for this feature</p>
                    </div>
                    <Badge className="bg-purple-600 text-white">Recommended</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {accessResult?.canTrial && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">Free Trial Available</h4>
                      <p className="text-sm text-green-700">Try this feature once for free!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-3">
              {accessResult?.canTrial && (
                <Button
                  onClick={handleTryFeature}
                  disabled={isTryingFeature}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isTryingFeature ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Activating Trial...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Try Once for Free
                    </>
                  )}
                </Button>
              )}

              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href={getUpgradeUrl(accessResult?.requiredTier)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button variant="outline" onClick={() => setShowModal(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

