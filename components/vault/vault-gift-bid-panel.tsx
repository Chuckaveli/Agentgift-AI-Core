"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Coins, Zap, Crown, Gem, Star, Volume2, Trophy, Target, Flame, Loader2, Users, Timer } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"

// Lottie Player component
import dynamic from "next/dynamic"
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key",
)

interface GiftItem {
  id: string
  name: string
  description: string
  tier: "common" | "uncommon" | "rare"
  starting_bid: number
  current_bid: number
  bid_count: number
  time_remaining: string
  image_url: string
  top_bidder?: string
}

interface BidResponse {
  success: boolean
  isEdit: boolean
  newTopBid: number
  bidCount: number
  excitementMessage: string
  actionType: "placed" | "edited"
}

// Tier configurations
const TIER_CONFIG = {
  common: {
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    icon: Star,
    voiceLine: "A modest bid. Sometimes the smallest moves win the biggest reactions.",
    animationUrl: "https://lottie.host/1c5038a7-90f5-4bb7-8f58-d776ad1ff60e/J7j4WhaEBx.json",
    minBid: 10,
  },
  uncommon: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Zap,
    voiceLine: "Nice choice, Agent. That uncommon tier is heating up.",
    animationUrl: "https://lottie.host/9286b888-d361-4c91-83a6-3d73341a0a35/Igr8grQjTx.json",
    minBid: 50,
  },
  rare: {
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    icon: Crown,
    voiceLine: "Ohhh—you're going rare? That's bold. Let's lock that bid in… and see who dares to top it.",
    animationUrl: "https://lottie.host/3f21221d-f478-4b17-a44f-50e3997c38d6/8MjN8YcCC9.json",
    minBid: 200,
  },
}

// Utility function to trigger Zyxen voice
async function triggerZyxenVoice({
  userId,
  lineSpoken,
  context,
  logOnly = false,
}: {
  userId: string
  lineSpoken: string
  context: string
  logOnly?: boolean
}) {
  try {
    await fetch("https://hook.us2.make.com/nk29vv9vafumafyhhri52ugld8nf4i0n", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        voice_id: "etYoGZvfOzWen08VcK5h", // Zyxen voice ID
        context,
        line_spoken: lineSpoken,
        log_only: logOnly,
      }),
    })
  } catch (error) {
    console.error("Failed to trigger Zyxen voice:", error)
  }
}

export function VaultGiftBidPanel() {
  const [selectedItem, setSelectedItem] = useState<GiftItem | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [giftItems, setGiftItems] = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const [userCoins, setUserCoins] = useState(1500)
  const animationRef = useRef<any>(null)

  // Mock user session
  const mockUser = {
    id: "user-vault-bidder-123",
    email: "bidder@agentgift.ai",
    team_id: "team-alpha",
    team_name: "Alpha Squad",
    name: "Agent Smith",
  }

  useEffect(() => {
    loadGiftItems()
  }, [])

  const loadGiftItems = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockItems: GiftItem[] = [
        {
          id: "gift-1",
          name: "Artisan Coffee Set",
          description: "Premium coffee beans from 5 different countries with brewing equipment",
          tier: "common",
          starting_bid: 25,
          current_bid: 45,
          bid_count: 3,
          time_remaining: "2h 15m",
          image_url: "/placeholder.svg?height=200&width=200&text=Coffee+Set",
          top_bidder: "Team Beta",
        },
        {
          id: "gift-2",
          name: "Smart Home Bundle",
          description: "Complete smart home starter kit with voice assistant and sensors",
          tier: "uncommon",
          starting_bid: 100,
          current_bid: 275,
          bid_count: 8,
          time_remaining: "1h 42m",
          image_url: "/placeholder.svg?height=200&width=200&text=Smart+Home",
          top_bidder: "Team Gamma",
        },
        {
          id: "gift-3",
          name: "Luxury Spa Weekend",
          description: "2-night luxury spa retreat for two with all amenities included",
          tier: "rare",
          starting_bid: 500,
          current_bid: 850,
          bid_count: 12,
          time_remaining: "45m",
          image_url: "/placeholder.svg?height=200&width=200&text=Spa+Weekend",
          top_bidder: "Team Delta",
        },
      ]

      setGiftItems(mockItems)
      if (mockItems.length > 0) {
        setSelectedItem(mockItems[0])
      }
    } catch (error) {
      console.error("Failed to load gift items:", error)
      toast.error("Failed to load gift items")
    } finally {
      setLoading(false)
    }
  }

  const playTierAnimation = async (tier: "common" | "uncommon" | "rare") => {
    const config = TIER_CONFIG[tier]
    setCurrentAnimation(config.animationUrl)
    setShowAnimation(true)

    // Auto-hide animation after 3 seconds
    setTimeout(() => {
      setShowAnimation(false)
      setCurrentAnimation(null)
    }, 3000)
  }

  const handleBid = async () => {
    if (!selectedItem || !bidAmount) {
      toast.error("Please select an item and enter a bid amount")
      return
    }

    const amount = Number.parseFloat(bidAmount)
    const tierConfig = TIER_CONFIG[selectedItem.tier]

    if (amount < tierConfig.minBid) {
      toast.error(`Minimum bid for ${selectedItem.tier} tier is ${tierConfig.minBid} VibeCoins`)
      return
    }

    if (amount <= selectedItem.current_bid) {
      toast.error("Bid must be higher than current bid")
      return
    }

    if (amount > userCoins) {
      toast.error("Insufficient VibeCoins")
      return
    }

    setBidding(true)

    try {
      // Call the bidding API
      const response = await fetch("/api/agentvault/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          teamId: mockUser.team_id,
          teamName: mockUser.team_name,
          bidAmount: amount,
          message: bidMessage,
          userId: mockUser.id,
          userName: mockUser.name,
        }),
      })

      if (!response.ok) {
        throw new Error("Bid failed")
      }

      const result: BidResponse = await response.json()

      if (result.success) {
        // Update local state
        setSelectedItem((prev) =>
          prev
            ? {
                ...prev,
                current_bid: result.newTopBid,
                bid_count: result.bidCount,
                top_bidder: mockUser.team_name,
              }
            : null,
        )

        // Update user coins
        setUserCoins((prev) => prev - amount)

        // Play tier-specific animation
        await playTierAnimation(selectedItem.tier)

        // Trigger Zyxen voice with tier-specific line
        await triggerZyxenVoice({
          userId: mockUser.id,
          context: "vault_bid",
          lineSpoken: tierConfig.voiceLine,
          logOnly: false,
        })

        // Success toast with excitement message
        toast.success(`🎯 Bid ${result.actionType}! ${result.excitementMessage}`, {
          description: `Your ${amount} VibeCoin bid is now the top bid!`,
          duration: 5000,
        })

        // Clear form
        setBidAmount("")
        setBidMessage("")
      }
    } catch (error) {
      console.error("Bid failed:", error)
      toast.error("Failed to place bid. Please try again.")
    } finally {
      setBidding(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-muted-foreground">Loading AgentVault items...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold">AgentVault™ Bidding</h2>
        </div>
        <p className="text-muted-foreground">Compete for exclusive gifts with your team</p>
      </div>

      {/* User Stats */}
      <div className="flex justify-center">
        <Card className="w-fit">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">{userCoins.toLocaleString()} VibeCoins</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>{mockUser.team_name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gift Items Carousel */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Items</h3>
          <div className="space-y-4">
            {giftItems.map((item) => {
              const tierConfig = TIER_CONFIG[item.tier]
              const TierIcon = tierConfig.icon

              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItem?.id === item.id
                      ? "ring-2 ring-purple-500 shadow-lg"
                      : "hover:shadow-md hover:scale-[1.02]"
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                          <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border`}>
                            <TierIcon className="w-3 h-3 mr-1" />
                            {item.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">{item.current_bid} VC</span>
                            <span className="text-muted-foreground">{item.bid_count} bids</span>
                          </div>
                          <div className="flex items-center gap-2 text-orange-600">
                            <Timer className="w-4 h-4" />
                            <span className="font-medium">{item.time_remaining}</span>
                          </div>
                        </div>
                        {item.top_bidder && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Top bidder: <span className="font-medium">{item.top_bidder}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bidding Panel */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Place Your Bid</h3>

          {selectedItem ? (
            <Card className="relative overflow-hidden">
              {/* Animation Overlay */}
              {showAnimation && currentAnimation && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="w-64 h-64">
                    <Lottie
                      ref={animationRef}
                      animationData={currentAnimation}
                      loop={false}
                      autoplay={true}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Bidding on: {selectedItem.name}
                </CardTitle>
                <CardDescription>
                  Current bid: <span className="font-bold">{selectedItem.current_bid} VibeCoins</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tier Info */}
                <Alert className={TIER_CONFIG[selectedItem.tier].bgColor}>
                  <Gem className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{selectedItem.tier.toUpperCase()} TIER</strong> - Minimum bid:{" "}
                    {TIER_CONFIG[selectedItem.tier].minBid} VibeCoins
                  </AlertDescription>
                </Alert>

                {/* Bid Amount */}
                <div className="space-y-2">
                  <Label htmlFor="bid-amount">Your Bid Amount</Label>
                  <div className="relative">
                    <Input
                      id="bid-amount"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum: ${TIER_CONFIG[selectedItem.tier].minBid}`}
                      min={TIER_CONFIG[selectedItem.tier].minBid}
                      max={userCoins}
                      step="1"
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge variant="outline" className="text-xs">
                        VibeCoins
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bid Message */}
                <div className="space-y-2">
                  <Label htmlFor="bid-message">Team Message (Optional)</Label>
                  <Textarea
                    id="bid-message"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Add a message to intimidate other teams..."
                    rows={3}
                    maxLength={200}
                  />
                </div>

                {/* Bid Preview */}
                {bidAmount && Number.parseFloat(bidAmount) > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Your bid:</span>
                      <span className="font-bold text-purple-600">{bidAmount} VibeCoins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Remaining balance:</span>
                      <span>{(userCoins - Number.parseFloat(bidAmount)).toLocaleString()} VibeCoins</span>
                    </div>
                  </div>
                )}

                {/* Bid Button */}
                <Button
                  onClick={handleBid}
                  disabled={
                    bidding ||
                    !bidAmount ||
                    Number.parseFloat(bidAmount) < TIER_CONFIG[selectedItem.tier].minBid ||
                    Number.parseFloat(bidAmount) <= selectedItem.current_bid ||
                    Number.parseFloat(bidAmount) > userCoins
                  }
                  className="w-full"
                  size="lg"
                >
                  {bidding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Bid...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 mr-2" />
                      Place Bid & Trigger Zyxen
                    </>
                  )}
                </Button>

                {/* Voice Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Volume2 className="w-3 h-3" />
                  <span>Zyxen will respond based on your bid tier</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select an item to start bidding</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
