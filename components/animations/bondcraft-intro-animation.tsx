"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, X } from "lucide-react"
import Image from "next/image"

interface BondCraftIntroAnimationProps {
  isOpen: boolean
  onClose: () => void
}

export function BondCraftIntroAnimation({ isOpen, onClose }: BondCraftIntroAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      if (animationStep < 3) {
        setAnimationStep(animationStep + 1)
      }
    }, 1500)

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
      <DialogContent className="max-w-2xl p-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-0 overflow-hidden">
        <div className="relative min-h-[500px] flex flex-col items-center justify-center p-8">
          {/* Close button */}
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          {/* Animated Gift Box */}
          <div className="relative mb-8">
            <div
              className={`transition-all duration-1000 ${
                animationStep >= 1 ? "scale-110 rotate-12" : "scale-100 rotate-0"
              }`}
            >
              <Image
                src="/images/agentgift-mascot-1.png"
                alt="AgentGift Mascot"
                width={200}
                height={200}
                className={`transition-all duration-1000 ${animationStep >= 2 ? "animate-bounce" : ""}`}
              />
            </div>

            {/* Sparkles around the gift */}
            {animationStep >= 1 && (
              <>
                <Sparkles className="absolute -top-4 -left-4 h-6 w-6 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute -top-2 -right-6 h-4 w-4 text-pink-400 animate-pulse delay-300" />
                <Sparkles className="absolute -bottom-2 -left-6 h-5 w-5 text-purple-400 animate-pulse delay-500" />
                <Sparkles className="absolute -bottom-4 -right-4 h-6 w-6 text-orange-400 animate-pulse delay-700" />
              </>
            )}

            {/* Hearts floating up */}
            {animationStep >= 2 && (
              <>
                <Heart className="absolute top-0 left-1/2 h-4 w-4 text-red-400 animate-ping" />
                <Heart className="absolute top-4 left-1/3 h-3 w-3 text-pink-400 animate-ping delay-200" />
                <Heart className="absolute top-2 right-1/3 h-5 w-5 text-purple-400 animate-ping delay-400" />
              </>
            )}
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4 max-w-md">
            <h1
              className={`text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-1000 ${
                animationStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Welcome to BondCraft™
            </h1>

            <p
              className={`text-lg text-muted-foreground transition-all duration-1000 delay-300 ${
                animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              AI-powered relationship rituals and trivia games designed to strengthen your emotional bonds
            </p>

            <div
              className={`space-y-2 transition-all duration-1000 delay-500 ${
                animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Build deeper connections</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>Discover relationship insights</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-purple-400" />
                <span>Create lasting memories</span>
              </div>
            </div>

            {animationStep >= 3 && (
              <Button
                onClick={onClose}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="h-4 w-4 mr-2" />
                Start Your Journey
              </Button>
            )}
          </div>

          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse" />
            <div className="absolute top-20 right-16 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse delay-300" />
            <div className="absolute bottom-16 left-20 w-24 h-24 bg-orange-200 rounded-full opacity-20 animate-pulse delay-500" />
            <div className="absolute bottom-20 right-10 w-18 h-18 bg-yellow-200 rounded-full opacity-20 animate-pulse delay-700" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

