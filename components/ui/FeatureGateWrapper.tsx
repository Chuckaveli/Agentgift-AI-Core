"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lock, Zap } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface FeatureGateWrapperProps {
  children: React.ReactNode
  featureId: string
  requiredTier: "free_agent" | "premium_spy"
  userTier: "free_agent" | "premium_spy"
  usageCount?: number
  usageLimit?: number
  customMessage?: string
}

export function FeatureGateWrapper({
  children,
  featureId,
  requiredTier,
  userTier,
  usageCount = 0,
  usageLimit = 0,
  customMessage,
}: FeatureGateWrapperProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)
  const [comingSoonAnimation, setComingSoonAnimation] = useState(null)

  // Load coming soon animation
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch("/coming_soon.json")
        const data = await response.json()
        setComingSoonAnimation(data)
      } catch (error) {
        console.error("Failed to load coming soon animation:", error)
      }
    }
    loadAnimation()
  }, [])

  const hasAccess = userTier === requiredTier || userTier === "premium_spy"
  const hasUsageRemaining = usageLimit === 0 || usageCount < usageLimit

  const handleLockedFeatureClick = () => {
    setShowComingSoonModal(true)
  }

  if (hasAccess && hasUsageRemaining) {
    return <>{children}</>
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {requiredTier === "premium_spy" ? "Premium Feature" : "Feature Locked"}
            </CardTitle>
            <CardDescription>
              {customMessage ||
                (requiredTier === "premium_spy"
                  ? "This feature is available for Premium Spy members"
                  : "Upgrade to access this feature")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {!hasUsageRemaining && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You've used {usageCount} of {usageLimit} free uses this month
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">
                {requiredTier === "premium_spy" ? "Premium Spy Required" : "Upgrade Required"}
              </Badge>
              <p className="text-muted-foreground">Unlock this feature and many more with a Premium Spy membership</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleLockedFeatureClick}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Coming Soon!</DialogTitle>
            <DialogDescription className="text-center">This premium feature will be available soon</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {comingSoonAnimation && (
              <div className="w-full h-48 flex items-center justify-center">
                <Lottie animationData={comingSoonAnimation} loop={true} className="w-full h-full" />
              </div>
            )}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                We're working hard to bring you amazing new features. Stay tuned!
              </p>
              <Button
                onClick={() => setShowComingSoonModal(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Got it!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
