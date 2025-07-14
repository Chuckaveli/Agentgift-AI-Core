"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrCode, Gift, Sparkles, MapPin, Clock, Share2 } from "lucide-react"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { GiftRevealModal } from "@/components/global/gift-reveal-modal"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface AgentGiftyProps {
  userTier: UserTier
}

interface GiftDrop {
  id: string
  title: string
  description: string
  location: string
  qrCode: string
  expiresAt: string
  isActive: boolean
  claimedBy?: string
}

export function AgentGifty({ userTier }: AgentGiftyProps) {
  const [recipientName, setRecipientName] = useState("")
  const [giftDescription, setGiftDescription] = useState("")
  const [location, setLocation] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createdDrop, setCreatedDrop] = useState<GiftDrop | null>(null)
  const [showRevealModal, setShowRevealModal] = useState(false)

  const handleCreateDrop = async () => {
    if (!recipientName || !giftDescription || !location) return

    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newDrop: GiftDrop = {
      id: `drop_${Date.now()}`,
      title: `Gift for ${recipientName}`,
      description: giftDescription,
      location: location,
      qrCode: `https://agentgift.ai/claim/${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    }

    setCreatedDrop(newDrop)
    setIsCreating(false)
  }

  const handleClaimDrop = () => {
    setShowRevealModal(true)
  }

  return (
    <UserTierGate userTier={userTier} requiredTier={TIERS.PRO_AGENT} featureName="Agent Gifty™">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agent Gifty™</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create personalized gift drops with QR codes for surprise reveals anywhere, anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Create Gift Drop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Create Gift Drop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Name
                </label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Who is this gift for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gift Description
                </label>
                <Input
                  value={giftDescription}
                  onChange={(e) => setGiftDescription(e.target.value)}
                  placeholder="Describe the perfect gift..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drop Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where should they find this?"
                />
              </div>

              <Button
                onClick={handleCreateDrop}
                disabled={!recipientName || !giftDescription || !location || isCreating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Drop...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Create Gift Drop
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Active Drop Display */}
          {createdDrop && (
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  Active Gift Drop
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-24 h-24 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">QR Code for {createdDrop.title}</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{createdDrop.qrCode}</code>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{createdDrop.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Expires in 24 hours</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share QR
                  </Button>
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleClaimDrop}>
                    <Gift className="w-4 h-4 mr-2" />
                    Test Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Agent Gifty™ Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create Drop</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Describe the perfect gift and choose a location for the surprise reveal.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Share QR Code</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send the QR code to your recipient with clues about where to find it.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Magic Reveal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  They scan the code at the location for a personalized gift reveal experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gift Reveal Modal */}
        <GiftRevealModal
          isOpen={showRevealModal}
          onClose={() => setShowRevealModal(false)}
          gift={
            createdDrop
              ? {
                  id: createdDrop.id,
                  title: "Surprise Coffee Date",
                  description:
                    "A cozy afternoon at your favorite local coffee shop with a special treat waiting for you!",
                  image: "/placeholder.svg?height=300&width=300",
                  price: "$25.00",
                  category: "Experience",
                  tags: ["coffee", "surprise", "local"],
                  rating: 4.9,
                  specialMessage: "Found through Agent Gifty™ at the perfect moment!",
                  revealAnimation: "sparkle",
                }
              : null
          }
          customMessage="Scanning QR code at the secret location..."
        />
      </div>
    </UserTierGate>
  )
}
