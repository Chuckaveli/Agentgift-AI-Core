"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Heart, Star, X, Share2, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface GiftReveal {
  id: string
  title: string
  description: string
  image: string
  price: string
  category: string
  tags: string[]
  rating: number
  specialMessage?: string
  revealAnimation?: "fade" | "slide" | "bounce" | "sparkle"
}

interface GiftRevealModalProps {
  isOpen: boolean
  onClose: () => void
  gift: GiftReveal | null
  showConfetti?: boolean
  customMessage?: string
}

export function GiftRevealModal({ isOpen, onClose, gift, showConfetti = true, customMessage }: GiftRevealModalProps) {
  const [isRevealing, setIsRevealing] = useState(false)
  const [showGift, setShowGift] = useState(false)

  useEffect(() => {
    if (isOpen && gift) {
      setIsRevealing(true)
      setShowGift(false)

      // Trigger reveal animation
      const timer = setTimeout(() => {
        setShowGift(true)
        setIsRevealing(false)

        // Trigger confetti if enabled
        if (showConfetti) {
          triggerConfetti()
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, gift, showConfetti])

  const triggerConfetti = () => {
    // In a real app, you'd use a confetti library like canvas-confetti
    console.log("🎉 Confetti triggered!")
  }

  if (!gift) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          {/* Reveal Animation */}
          {isRevealing && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Gift className="w-12 h-12 text-white animate-bounce" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin opacity-30" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Revealing Your Perfect Gift...</h2>
              <p className="text-gray-600 dark:text-gray-400">{customMessage || "Get ready for something amazing!"}</p>
            </div>
          )}

          {/* Gift Reveal */}
          {showGift && (
            <div
              className={cn(
                "space-y-6",
                gift.revealAnimation === "fade" && "animate-in fade-in duration-1000",
                gift.revealAnimation === "slide" && "animate-in slide-in-from-bottom duration-1000",
                gift.revealAnimation === "bounce" && "animate-in zoom-in duration-1000",
                gift.revealAnimation === "sparkle" && "animate-in fade-in zoom-in duration-1000",
              )}
            >
              {/* Header */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Perfect Match Found!
                  </h1>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
                {gift.specialMessage && (
                  <p className="text-purple-700 dark:text-purple-300 font-medium">{gift.specialMessage}</p>
                )}
              </div>

              {/* Gift Card */}
              <Card className="overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-xl">
                <div className="aspect-square overflow-hidden">
                  <img src={gift.image || "/placeholder.svg"} alt={gift.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{gift.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{gift.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{gift.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{gift.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {gift.category}
                      </Badge>
                      {gift.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Heart className="w-4 h-4 mr-2" />I Love It!
                </Button>
                <Button variant="outline" className="bg-white/50">
                  <Gift className="w-4 h-4 mr-2" />
                  Find Similar
                </Button>
              </div>

              {/* Share Options */}
              <div className="flex justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

