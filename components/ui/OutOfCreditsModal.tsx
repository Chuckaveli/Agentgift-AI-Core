"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Zap, TrendingUp, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface OutOfCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  userXP?: number
  userLevel?: number
  creditsNeeded?: number
}

export function OutOfCreditsModal({
  isOpen,
  onClose,
  userXP = 0,
  userLevel = 1,
  creditsNeeded = 1,
}: OutOfCreditsModalProps) {
  const router = useRouter()

  // Calculate XP progress
  const xpForCurrentLevel = (userLevel - 1) * 150
  const xpForNextLevel = userLevel * 150
  const xpProgress = userXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - userXP
  const creditsToNextLevel = Math.ceil(xpNeeded / 0.5) // 2 credits = 1 XP

  const handleUpgrade = () => {
    router.push("/pricing")
    onClose()
  }

  const handleEarnCredits = () => {
    router.push("/features/social-proof-verifier")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">Out of Credits!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center text-gray-600">
            <p>
              You need <span className="font-semibold text-orange-500">{creditsNeeded} credits</span> to use this
              feature.
            </p>
            <p className="text-sm mt-1">Don't worry - there are several ways to get more!</p>
          </div>

          {/* XP Progress Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {userLevel} Progress</span>
                <span className="text-xs text-gray-500">{xpProgress}/150 XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(xpProgress / 150) * 100}%` }}
                />
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Only {creditsToNextLevel} credits away from leveling up!
              </div>
            </CardContent>
          </Card>

          {/* Action Options */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan - Get More Credits
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={handleEarnCredits}
              variant="outline"
              className="w-full border-purple-200 hover:bg-purple-50 bg-transparent"
            >
              <Coins className="w-4 h-4 mr-2" />
              Earn Free Credits
            </Button>
          </div>

          {/* Credit Earning Tips */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Quick Ways to Earn Credits:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Share on social media (+2 credits)</li>
              <li>• Complete your profile (+5 credits)</li>
              <li>• Invite a friend (+10 credits)</li>
              <li>• Leave a review (+3 credits)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
