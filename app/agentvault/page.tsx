"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  Coins,
  Trophy,
  Flame,
  Zap,
  Crown,
  Star,
  Timer,
  Users,
  TrendingUp,
  Gift,
  Sparkles,
  Target,
  Award,
} from "lucide-react"
import { toast } from "sonner"

interface VaultSeason {
  id: string
  season_name: string
  season_type: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface VaultReward {
  id: string
  name: string
  description: string
  tier: "common" | "uncommon" | "rare" | "legendary"
  starting_bid: number
  current_bid: number
  bid_increment: number
  current_stock: number
  image_url?: string
  rarity_aura?: string
  bidCount: number
  isHot: boolean
  highestBid: number
  timeLeft?: number
  current_bids?: any[]
}

interface VaultCoins {
  balance: number
  total_earned: number
  total_spent: number
  last_earned_at?: string
}

interface AuctionStatus {
  isActive: boolean
  season: VaultSeason | null
  timeRemaining: number | null
  stats: {
    totalBids: number
    activeRewards: number
    eligibleCompanies: number
    vaultCoinsCirculating: number
  }
}

const TIER_COLORS = {
  common: "from-gray-400 to-gray-600",
  uncommon: "from-green-400 to-green-600",
  rare: "from-blue-400 to-blue-600",
  legendary: "from-purple-400 to-purple-600",
}

const TIER_ICONS = {
  common: Star,
  uncommon: Zap,
  rare: Crown,
  legendary: Sparkles,
}

export default function AgentVaultPage() {
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus | null>(null)
  const [rewards, setRewards] = useState<VaultReward[]>([])
  const [userCoins, setUserCoins] = useState<VaultCoins | null>(null)
  const [selectedReward, setSelectedReward] = useState<VaultReward | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string>("all")

  // Mock user data - replace with actual auth
  const mockUser = {
    id: "user-123",
    companyId: "company-456",
    name: "Agent Smith",
    tier: "premium_spy",
  }

  useEffect(() => {
    loadAuctionData()
    const interval = setInterval(loadAuctionData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadAuctionData = async () => {
    try {
      // Load auction status
      const statusRes = await fetch("/api/agentvault/status")
      const statusData = await statusRes.json()
      setAuctionStatus(statusData)

      // Load rewards
      const rewardsRes = await fetch("/api/agentvault/rewards")
      const rewardsData = await rewardsRes.json()
      setRewards(rewardsData.rewards || [])

      // Load user coins
      const coinsRes = await fetch(`/api/agentvault/coins?userId=${mockUser.id}&companyId=${mockUser.companyId}`)
      const coinsData = await coinsRes.json()
      setUserCoins(coinsData.balance)
    } catch (error) {
      console.error("Failed to load auction data:", error)
      toast.error("Failed to load auction data")
    } finally {
      setLoading(false)
    }
  }

  const placeBid = async () => {
    if (!selectedReward || !bidAmount) return

    setBidding(true)
    try {
      const response = await fetch("/api/agentvault/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          bidAmount: Number.parseInt(bidAmount),
          message: bidMessage,
          companyId: mockUser.companyId,
          userId: mockUser.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Bid placed successfully as ${data.anonymizedName}!`)
        if (data.orionNarration) {
          toast.info(`Agent Orion: "${data.orionNarration}"`)
        }
        setBidAmount("")
        setBidMessage("")
        setSelectedReward(null)
        loadAuctionData() // Refresh data
      } else {
        toast.error(data.error || "Failed to place bid")
      }
    } catch (error) {
      console.error("Bid error:", error)
      toast.error("Failed to place bid")
    } finally {
      setBidding(false)
    }
  }

  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const filteredRewards = selectedTier === "all" ? rewards : rewards.filter((r) => r.tier === selectedTier)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AgentVault™...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!auctionStatus?.isActive) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">AgentVault™</h1>
            <p className="text-xl text-muted-foreground mb-6">Seasonal Live Auction Chamber</p>
          </div>

          <Alert className="max-w-2xl mx-auto">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>The Vault is Currently Sealed</strong>
              <br />
              AgentVault™ opens 4 times per year for 7-day auction periods. Only elite companies who have completed
              prestige-level rituals may enter.
              <br />
              <br />
              <strong>Next Opening:</strong> Check back for seasonal announcements
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <CardTitle className="text-lg">Earn VaultCoins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete EmotiTokens, BondCraft™, and other high-value rituals to earn VaultCoins
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <CardTitle className="text-lg">Qualify Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Meet eligibility requirements: Gift Grid 3x, Company XP ≥30, 60-day Sentiment Sync
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <CardTitle className="text-lg">Claim Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bid on exclusive rewards: Pro+ memberships, team trips, branded swag, and more
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">AgentVault™</h1>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {auctionStatus.season?.season_name}
          </Badge>
        </div>

        {auctionStatus.timeRemaining && (
          <div className="flex items-center justify-center gap-2 text-lg">
            <Timer className="w-5 h-5 text-orange-500" />
            <span className="font-mono font-bold text-orange-500">
              {formatTimeRemaining(auctionStatus.timeRemaining)}
            </span>
            <span className="text-muted-foreground">remaining</span>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{auctionStatus.stats.totalBids}</div>
            <div className="text-sm text-muted-foreground">Total Bids</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{auctionStatus.stats.activeRewards}</div>
            <div className="text-sm text-muted-foreground">Active Rewards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{auctionStatus.stats.eligibleCompanies}</div>
            <div className="text-sm text-muted-foreground">Eligible Teams</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{userCoins?.balance || 0}</div>
            <div className="text-sm text-muted-foreground">Your VaultCoins</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auction">🔥 Live Auction</TabsTrigger>
          <TabsTrigger value="coins">💰 VaultCoins</TabsTrigger>
          <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
          <TabsTrigger value="history">📜 History</TabsTrigger>
        </TabsList>

        <TabsContent value="auction" className="space-y-6">
          {/* Tier Filter */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedTier === "all" ? "default" : "outline"}
              onClick={() => setSelectedTier("all")}
              size="sm"
            >
              All Tiers
            </Button>
            {Object.keys(TIER_COLORS).map((tier) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? "default" : "outline"}
                onClick={() => setSelectedTier(tier)}
                size="sm"
                className={
                  selectedTier === tier
                    ? `bg-gradient-to-r ${TIER_COLORS[tier as keyof typeof TIER_COLORS]} text-white`
                    : ""
                }
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const TierIcon = TIER_ICONS[reward.tier]
              return (
                <Card
                  key={reward.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    reward.isHot ? "ring-2 ring-orange-500 shadow-orange-500/20" : ""
                  }`}
                >
                  {reward.isHot && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-orange-500 text-white">
                        <Flame className="w-3 h-3 mr-1" />
                        HOT
                      </Badge>
                    </div>
                  )}

                  <div className={`h-2 bg-gradient-to-r ${TIER_COLORS[reward.tier]}`} />

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TierIcon className="w-5 h-5" />
                        <Badge
                          variant="outline"
                          className={`bg-gradient-to-r ${TIER_COLORS[reward.tier]} text-white border-0`}
                        >
                          {reward.tier}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Current Bid</div>
                        <div className="text-lg font-bold flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          {reward.current_bid}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Bids: {reward.bidCount}</span>
                        <span>Stock: {reward.current_stock}</span>
                      </div>

                      {reward.current_bids && reward.current_bids.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Recent Bids:</div>
                          {reward.current_bids.slice(0, 3).map((bid, index) => (
                            <div key={index} className="flex justify-between text-xs bg-muted p-2 rounded">
                              <span>{bid.anonymized_name}</span>
                              <span className="font-mono">{bid.bid_amount} coins</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => setSelectedReward(reward)}
                        className="w-full"
                        disabled={!userCoins || userCoins.balance <= reward.current_bid}
                      >
                        Place Bid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="coins">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  VaultCoin Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">{userCoins?.balance || 0}</div>
                  <div className="text-muted-foreground">Available VaultCoins</div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Earned:</span>
                    <span className="font-mono">{userCoins?.total_earned || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-mono">{userCoins?.total_spent || 0}</span>
                  </div>
                  {userCoins?.last_earned_at && (
                    <div className="flex justify-between">
                      <span>Last Earned:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(userCoins.last_earned_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Earn VaultCoins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-sm">❤️</span>
                    </div>
                    <div>
                      <div className="font-medium">EmotiTokens</div>
                      <div className="text-sm text-muted-foreground">5-10 coins per token sent</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm">🤝</span>
                    </div>
                    <div>
                      <div className="font-medium">BondCraft™</div>
                      <div className="text-sm text-muted-foreground">15-25 coins per session</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <div>
                      <div className="font-medium">Sentiment Sync</div>
                      <div className="text-sm text-muted-foreground">20 coins per week streak</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    <div>
                      <div className="font-medium">Feature Streaks</div>
                      <div className="text-sm text-muted-foreground">10-30 coins per milestone</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Auction Champions</CardTitle>
              <CardDescription>Top performers in the current season</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Leaderboard data will appear here during active auctions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Auction History</CardTitle>
              <CardDescription>Past winners and legendary moments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Historical auction data will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bid Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Place Bid
              </CardTitle>
              <CardDescription>
                Bidding on: <strong>{selectedReward.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Current Bid:</span>
                  <span className="font-bold">{selectedReward.current_bid} coins</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Balance:</span>
                  <span className="font-bold text-yellow-500">{userCoins?.balance || 0} coins</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bid Amount</label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ${selectedReward.current_bid + selectedReward.bid_increment}`}
                  min={selectedReward.current_bid + selectedReward.bid_increment}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message (Optional)</label>
                <Textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Add a message with your bid..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setSelectedReward(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={placeBid}
                  disabled={bidding || !bidAmount || Number.parseInt(bidAmount) <= selectedReward.current_bid}
                  className="flex-1"
                >
                  {bidding ? "Placing Bid..." : "Place Bid"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
