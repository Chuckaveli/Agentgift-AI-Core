"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, Heart, Sparkles, Eye, Share2, Download, Star } from "lucide-react"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface GiftRealViewerProps {
  userTier: UserTier
}

interface GiftReveal {
  id: string
  title: string
  description: string
  from: string
  occasion: string
  message: string
  image: string
  isRevealed: boolean
  createdAt: string
}

const mockGiftReveals: GiftReveal[] = [
  {
    id: "1",
    title: "Birthday Surprise",
    description: "A special birthday gift just for you",
    from: "Alex Chen",
    occasion: "Birthday",
    message: "Happy Birthday! You deserve all the happiness in the world. This gift represents all the joy you bring to my life.",
    image: "/placeholder.svg?height=300&width=300",
    isRevealed: false,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Anniversary Gift",
    description: "Celebrating our special day",
    from: "Sarah Johnson",
    occasion: "Anniversary",
    message: "Another year of love and laughter with you. Here's to many more beautiful moments together.",
    image: "/placeholder.svg?height=300&width=300",
    isRevealed: true,
    createdAt: "2024-01-10T14:20:00Z",
  },
  {
    id: "3",
    title: "Just Because",
    description: "Because you're amazing",
    from: "Mike Wilson",
    occasion: "Just Because",
    message: "Sometimes the best gifts are given for no reason at all. You make every day special.",
    image: "/placeholder.svg?height=300&width=300",
    isRevealed: false,
    createdAt: "2024-01-12T09:15:00Z",
  },
]

export function GiftRealViewer({ userTier }: GiftRealViewerProps) {
  console.log("GiftRealViewer component rendered with userTier:", userTier)
  
  const [selectedGift, setSelectedGift] = useState<GiftReveal | null>(null)
  const [showReveal, setShowReveal] = useState(false)

  const handleGiftSelect = (gift: GiftReveal) => {
    console.log("Gift selected:", gift.title)
    setSelectedGift(gift)
    if (gift.isRevealed) {
      setShowReveal(true)
    }
  }

  const handleReveal = () => {
    console.log("Revealing gift...")
    if (selectedGift) {
      setShowReveal(true)
      // In a real app, this would update the gift status in the database
    }
  }

  console.log("About to render UserTierGate with tier:", userTier)
  
  return (
    <UserTierGate userTier={userTier} requiredTier={TIERS.PREMIUM_SPY} featureName="Gift Real Viewer">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <a href="/dashboard">
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gift Real Viewer™</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View and reveal your gifts</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {!selectedGift ? (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Your Gift Reveals
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Discover and reveal the special gifts waiting for you from your loved ones.
                  </p>
                </div>

                {/* Gift Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockGiftReveals.map((gift) => (
                    <Card
                      key={gift.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        gift.isRevealed ? "ring-2 ring-green-200 dark:ring-green-800" : "ring-2 ring-purple-200 dark:ring-purple-800"
                      }`}
                      onClick={() => handleGiftSelect(gift)}
                    >
                      <CardContent className="p-6">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                          {gift.isRevealed ? (
                            <Gift className="w-12 h-12 text-green-600" />
                          ) : (
                            <div className="text-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Sparkles className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-sm text-gray-500">Hidden Gift</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={gift.isRevealed ? "default" : "secondary"}>
                              {gift.isRevealed ? "Revealed" : "Hidden"}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">New</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{gift.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{gift.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>From: {gift.from}</span>
                            <span>{new Date(gift.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* How It Works */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">How Gift Real Viewer Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Receive Gifts</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Friends and family send you surprise gifts through the platform
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose to Reveal</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Decide when you want to reveal and see your special gifts
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enjoy & Share</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          View your gifts, read personal messages, and share the joy
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedGift(null)
                    setShowReveal(false)
                  }}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Gifts
                </Button>

                {/* Gift Details */}
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGift.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">{selectedGift.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Gift Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      {showReveal ? (
                        <img
                          src={selectedGift.image}
                          alt={selectedGift.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hidden Gift</h3>
                          <p className="text-gray-600 dark:text-gray-400">Click reveal to see your special surprise</p>
                        </div>
                      )}
                    </div>

                    {/* Gift Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">From:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedGift.from}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Occasion:</span>
                        <Badge variant="outline">{selectedGift.occasion}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Received:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(selectedGift.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    {showReveal && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Message</h4>
                        <p className="text-gray-700 dark:text-gray-300 italic">"{selectedGift.message}"</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {!showReveal ? (
                        <Button
                          onClick={handleReveal}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          size="lg"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Reveal Gift
                        </Button>
                      ) : (
                        <>
                          <Button
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            size="lg"
                          >
                            <Heart className="w-5 h-5 mr-2" />
                            Thank Sender
                          </Button>
                          <Button variant="outline" size="lg" className="flex-1">
                            <Share2 className="w-5 h-5 mr-2" />
                            Share Joy
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserTierGate>
  )
} 