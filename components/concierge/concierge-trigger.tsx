"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"
import { GiftConciergeModal } from "./gift-concierge-modal"
import { Badge } from "@/components/ui/badge"

interface ConciergeTriggerProps {
  userTier: string
  userCredits: number
  onCreditsUpdate: (newCredits: number) => void
}

export function ConciergeTrigger({ userTier, userCredits, onCreditsUpdate }: ConciergeTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Notification Badge */}
          {userCredits > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-0 text-xs px-1.5 py-0.5 animate-pulse">
              {userCredits}
            </Badge>
          )}

          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            size="icon"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
            </div>

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500" />
          </Button>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Ask Concierge
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      </div>

      <GiftConciergeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userTier={userTier}
        userCredits={userCredits}
        onCreditsUpdate={onCreditsUpdate}
      />
    </>
  )
}

