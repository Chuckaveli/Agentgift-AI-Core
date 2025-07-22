"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown, Zap, X, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import LottieAnimation from "@/components/animations/lottie-animation"
import comingSoonAnimation from "@/public/coming_soon.json"
import { Card, CardContent } from "@/components/ui/card"

interface LockedFeatureAnimationProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  requiredTier?: string
}

export function LockedFeatureAnimation({
  isOpen,
  onClose,
  featureName = "Advanced Feature",
  requiredTier = "Pro",
}: LockedFeatureAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      if (animationStep < 2) {
        setAnimationStep(animationStep + 1)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [isOpen, animationStep])

  const resetAnimation = () => {
    setAnimationStep(0)
  }

  useEffect(() => {
    if (isOpen) {
      resetAnimation()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 border-0 overflow-hidden">
        <div className="relative min-h-[400px] flex flex-col items-center justify-center p-6">
          {/* Close button */}
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          {/* Animated Gift Box with Lock */}
          <div className="relative mb-6">
            <div className={`transition-all duration-1000 ${animationStep >= 1 ? "scale-110" : "scale-100"}`}>
              <div className="relative">
                <Image
                  src="/images/agentgift-mascot-2.png"
                  alt="Locked Feature"
                  width={150}
                  height={150}
                  className={`transition-all duration-1000 ${
                    animationStep >= 1 ? "grayscale opacity-60" : "grayscale-0 opacity-100"
                  }`}
                />

                {/* Lock overlay */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                    animationStep >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shake animation for locked state */}
            {animationStep >= 2 && (
              <div className="absolute inset-0 animate-pulse">
                <div className="w-full h-full border-2 border-red-300 rounded-full opacity-50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-center space-y-4 max-w-sm">
            <div
              className={`transition-all duration-1000 ${
                animationStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Feature Locked</h2>
              <p className="text-muted-foreground">
                <span className="font-semibold">{featureName}</span> requires a higher tier to access
              </p>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ${
                animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Current vs Required Tier */}
              <div className="bg-white rounded-lg p-4 border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan:</span>
                  <Badge variant="secondary">Free Agent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Required:</span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Crown className="h-3 w-3 mr-1" />
                    {requiredTier}
                  </Badge>
                </div>
              </div>

              {/* Benefits */}
              <div className="text-left space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span>Unlimited feature access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-purple-500" />
                  <span>Priority AI processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-purple-500" />
                  <span>Advanced relationship tools</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Link href="/pricing">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-8 left-8 w-12 h-12 bg-gray-200 rounded-full opacity-20 animate-pulse" />
            <div className="absolute top-16 right-12 w-8 h-8 bg-gray-300 rounded-full opacity-20 animate-pulse delay-300" />
            <div className="absolute bottom-12 left-12 w-16 h-16 bg-gray-200 rounded-full opacity-20 animate-pulse delay-500" />
            <div className="absolute bottom-16 right-8 w-10 h-10 bg-gray-300 rounded-full opacity-20 animate-pulse delay-700" />
          </div>

          {/* Coming Soon Animation */}
          {animationStep >= 2 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative w-full max-w-md">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-300" onClick={onClose}>
                  <X className="h-6 w-6" />
                </button>
                <Card>
                  <CardContent className="p-4">
                    <LottieAnimation animationData={comingSoonAnimation} loop={true} autoplay={true} />
                    <p className="text-center text-gray-600 dark:text-gray-400">
                      This feature is coming soon! Upgrade to Pro to get notified when it's released.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
