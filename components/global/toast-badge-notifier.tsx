"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Trophy, Star, Zap } from "lucide-react"

interface ToastBadgeNotifierProps {
  onXPGain?: (amount: number, reason?: string) => void
  onBadgeUnlock?: (badgeName: string) => void
  onLevelUp?: (newLevel: number) => void
  onPrestige?: (prestigeLevel: string) => void
}

export function ToastBadgeNotifier({ onXPGain, onBadgeUnlock, onLevelUp, onPrestige }: ToastBadgeNotifierProps) {
  useEffect(() => {
    // Listen for global events
    const handleXPGain = (event: CustomEvent) => {
      const { amount, reason } = event.detail
      toast.success(`+${amount} XP`, {
        description: reason,
        duration: 2000,
        icon: <Zap className="h-4 w-4 text-yellow-500" />,
      })
      onXPGain?.(amount, reason)
    }

    const handleBadgeUnlock = (event: CustomEvent) => {
      const { badgeName, description } = event.detail
      toast.success("Achievement Unlocked!", {
        description: (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>{badgeName}</span>
          </div>
        ),
        duration: 4000,
      })
      onBadgeUnlock?.(badgeName)
    }

    const handleLevelUp = (event: CustomEvent) => {
      const { newLevel } = event.detail
      toast.success(`Level Up! You're now level ${newLevel}`, {
        description: "Keep up the great gifting!",
        duration: 4000,
        icon: <Star className="h-4 w-4 text-purple-500" />,
      })
      onLevelUp?.(newLevel)
    }

    const handlePrestige = (event: CustomEvent) => {
      const { prestigeLevel } = event.detail
      toast.success(`Prestige Achieved: ${prestigeLevel}!`, {
        description: "You've unlocked exclusive benefits and lifetime discounts!",
        duration: 6000,
        icon: <Trophy className="h-4 w-4 text-gold-500" />,
      })
      onPrestige?.(prestigeLevel)
    }

    window.addEventListener("xpGain", handleXPGain as EventListener)
    window.addEventListener("badgeUnlock", handleBadgeUnlock as EventListener)
    window.addEventListener("levelUp", handleLevelUp as EventListener)
    window.addEventListener("prestige", handlePrestige as EventListener)

    return () => {
      window.removeEventListener("xpGain", handleXPGain as EventListener)
      window.removeEventListener("badgeUnlock", handleBadgeUnlock as EventListener)
      window.removeEventListener("levelUp", handleLevelUp as EventListener)
      window.removeEventListener("prestige", handlePrestige as EventListener)
    }
  }, [onXPGain, onBadgeUnlock, onLevelUp, onPrestige])

  return null
}

// Helper functions to trigger events
export const triggerXPGain = (amount: number, reason?: string) => {
  window.dispatchEvent(new CustomEvent("xpGain", { detail: { amount, reason } }))
}

export const triggerBadgeUnlock = (badgeName: string, description?: string) => {
  window.dispatchEvent(new CustomEvent("badgeUnlock", { detail: { badgeName, description } }))
}

export const triggerLevelUp = (newLevel: number) => {
  window.dispatchEvent(new CustomEvent("levelUp", { detail: { newLevel } }))
}

export const triggerPrestige = (prestigeLevel: string) => {
  window.dispatchEvent(new CustomEvent("prestige", { detail: { prestigeLevel } }))
}
