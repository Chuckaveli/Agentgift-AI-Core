"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
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
  Target,
  Award,
  Edit,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

interface AuctionStatus {
  isAuctionLive: boolean
  phase: string
  currentSeason: string
  timeRemaining: number | null
  nextAuctionDate: string | null
  stats: {
    qualifiedTeams: number
    activeItems: number
    totalBids: number
  }
}

interface AuctionItem {
  id: string
  title: string
  description: string
  tier: "common" | "uncommon" | "rare"
  tier_emoji: string
  starting_bid: number
  current_top_bid: number
  current_top_team_name: string | null
  bid_count: number
  position_in_rotation: number
  topBids: any[]
  currentWinner: any
  isHotItem: boolean
  lastBidTime: string | null
}

interface TeamCoins {
  balance: number
  total_earned: number
  total_spent: number
  is_qualified: boolean
  min_xp_met: boolean
  event_participation_count: number
}

const TIER_COLORS = {
  common: "from-green-400 to-green-600",
  uncommon: "from-yellow-400 to-yellow-600",
  rare: "from-blue-400 to-blue-600",
}

const TIER_ICONS = {
  common: Star,
  uncommon: Zap,
  rare: Crown,
}

export default function AgentVaultPage() {
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus | null>(null)
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([])
  const [teamCoins, setTeamCoins] = useState<TeamCoins | null>(null)
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string>("all")

  // Mock user/team data - replace with actual auth
  const mockTeam = {
    id: "team-123",
    name: "Alpha Squad",
    userId: "user-456",
    userName: "Team Lead",
    role: "team_lead",
  }

  useEffect(() => {
    loadAuctionData()
    const interval = setInterval(loadAuctionData, 15000) // Refresh every 15 seconds for live updates
    return () => clearInterval(interval)
  }, [])

  const loadAuctionData = async () => {
    try {
      // Load auction status
      const statusRes = await fetch("/api/agentvault/status")
      const statusData = await statusRes.json()
      setAuctionStatus(statusData)

      // Load auction items
      const itemsRes = await fetch("/api/agentvault/items")
      const itemsData = await itemsRes.json()
      setAuctionItems(itemsData.items || [])

      // Load team coins
      const coinsRes = await fetch(`/api/agentvault/coins?teamId=${mockTeam.id}`)
      const coinsData = await coinsRes.json()
      setTeamCoins(coinsData.balance)
    } catch (error) {
      console.error("Failed to load auction data:", error)
      toast.error("Failed to load auction data")
    } finally {
      setLoading(false)
    }
  }

  const placeBid = async () => {
    if (!selectedItem || !bidAmount) return

    setBidding(true)
    try {
      const response = await fetch("/api/agentvault/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          teamId: mockTeam.id,
          teamName: mockTeam.name,
          bidAmount: Number.parseInt(bidAmount),
          message: bidMessage,
          userId: mockTeam.userId,
          userName: mockTeam.userName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const actionText = data.isEdit ? "updated" : "placed"
        toast.success(`Bid ${actionText} successfully! 🎯`)
        if (data.excitementMessage) {
          toast.info(data.excitementMessage)
        }
        setBidAmount("")
        setBidMessage("")
        setSelectedItem(null)
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

  const filteredItems =
    selectedTier === "all" ? auctionItems : auctionItems.filter((item) => item.tier === selectedTier)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Giftverse Mastermind AI...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show sealed vault when auction is not live
  if (!auctionStatus?.isAuctionLive) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">🔒 No Active Auction Right Now</h1>
            <p className="text-xl text-muted-foreground mb-6">
              The next AgentVault™ event will launch on{" "}
              {auctionStatus?.nextAuctionDate ? new Date(auctionStatus.nextAuctionDate).toLocaleDateString() : "TBD"}
            </p>
          </div>

          <Alert className="max-w-2xl mx-auto mb-8">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>📬 Want a reminder?</strong>
              <br />
              We'll notify your team when the vault opens again. AgentVault™ runs for 7 days once per season (every 28
              days) with exclusive rewards for qualifying teams.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <CardTitle className="text-lg">Earn VibeCoins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete Gift-Off™, EmotiTokens, and EmotionCraft to earn team VibeCoins for bidding
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
                  Meet minimum XP requirements or complete event participation to access the auction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <CardTitle className="text-lg">Win Exclusive Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bid on 15 rotating rewards: team experiences, XP boosts, premium perks, and more
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
      {/* Giftverse Mastermind AI Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">🧠 Giftverse Mastermind AI</h1>
          <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-blue-500 text-white animate-pulse">
            LIVE AUCTION
          </Badge>
        </div>

        <p className="text-lg text-muted-foreground mb-4">
          AgentVault™ • {auctionStatus.currentSeason} • Phase: {auctionStatus.phase}
        </p>

        {auctionStatus.timeRemaining && (
          <div className="flex items-center justify-center gap-2 text-xl">
            <Timer className="w-6 h-6 text-orange-500 animate-bounce" />
            <span className="font-mono font-bold text-orange-500 text-2xl">
              {formatTimeRemaining(auctionStatus.timeRemaining)}
            </span>
            <span className="text-muted-foreground">remaining</span>
          </div>
        )}
      </div>

      {/* Team Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className={teamCoins?.is_qualified ? "ring-2 ring-green-500" : "ring-2 ring-red-500"}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {teamCoins?.is_qualified ? (
                <Trophy className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="text-lg font-bold">{teamCoins?.is_qualified ? "QUALIFIED" : "NOT QUALIFIED"}</div>
            <div className="text-sm text-muted-foreground">Team Status</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{teamCoins?.balance || 0}</div>
            <div className="text-sm text-muted-foreground">VibeCoins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{auctionStatus.stats.totalBids}</div>
            <div className="text-sm text-muted-foreground">Total Bids</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{auctionStatus.stats.qualifiedTeams}</div>
            <div className="text-sm text-muted-foreground">Qualified Teams</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auction">🔥 Live Auction</TabsTrigger>
          <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
          <TabsTrigger value="coins">💰 VibeCoins</TabsTrigger>
          <TabsTrigger value="rules">📋 Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="auction" className="space-y-6">
          {!teamCoins?.is_qualified && (
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Team Not Qualified:</strong> Your team needs to meet minimum XP requirements or complete event
                participation to access the auction. View-only access granted.
              </AlertDescription>
            </Alert>
          )}

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
                {tier === "common" && "🟢"} {tier === "uncommon" && "🟡"} {tier === "rare" && "🔵"}{" "}
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Button>
            ))}
          </div>

          {/* Auction Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const TierIcon = TIER_ICONS[item.tier]
              const hasExistingBid = item.currentWinner?.team_name === mockTeam.name

              return (
                <Card
                  key={item.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    item.isHotItem ? "ring-2 ring-orange-500 shadow-orange-500/20 animate-pulse" : ""
                  } ${hasExistingBid ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                >
                  {item.isHotItem && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-orange-500 text-white animate-bounce">
                        <Flame className="w-3 h-3 mr-1" />🔥 HOT
                      </Badge>
                    </div>
                  )}

                  {hasExistingBid && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-blue-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        WINNING
                      </Badge>
                    </div>
                  )}

                  <div className={`h-2 bg-gradient-to-r ${TIER_COLORS[item.tier]}`} />

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.tier_emoji}</span>
                        <Badge
                          variant="outline"
                          className={`bg-gradient-to-r ${TIER_COLORS[item.tier]} text-white border-0`}
                        >
                          {item.tier}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Current Top Bid</div>
                        <div className="text-lg font-bold flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          {item.current_top_bid || item.starting_bid}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Bids: {item.bid_count}</span>
                        <span>Position: #{item.position_in_rotation}</span>
                      </div>

                      {item.current_top_team_name && (
                        <div className="bg-muted p-2 rounded text-sm">
                          <strong>Leading Team:</strong> {item.current_top_team_name}
                        </div>
                      )}

                      {item.topBids && item.topBids.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Top Bids:</div>
                          {item.topBids.slice(0, 3).map((bid, index) => (
                            <div key={index} className="flex justify-between text-xs bg-muted p-2 rounded">
                              <span>{bid.team_name}</span>
                              <span className="font-mono">{bid.bid_amount} coins</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedItem(item)}
                          className="flex-1"
                          disabled={!teamCoins?.is_qualified}
                        >
                          {hasExistingBid ? (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Bid
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4 mr-2" />
                              Place Bid
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Live Auction Leaderboard</CardTitle>
              <CardDescription>Current winners and top bidders across all items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Leaderboard updates in real-time during active bidding</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coins">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Team VibeCoins Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">{teamCoins?.balance || 0}</div>
                  <div className="text-muted-foreground">Available VibeCoins</div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Earned:</span>
                    <span className="font-mono">{teamCoins?.total_earned || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-mono">{teamCoins?.total_spent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualification Status:</span>
                    <Badge variant={teamCoins?.is_qualified ? "default" : "destructive"}>
                      {teamCoins?.is_qualified ? "Qualified" : "Not Qualified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Earn VibeCoins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    <div>
                      <div className="font-medium">Gift-Off™ Events</div>
                      <div className="text-sm text-muted-foreground">15-25 coins per team participation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm">❤️</span>
                    </div>
                    <div>
                      <div className="font-medium">EmotiTokens</div>
                      <div className="text-sm text-muted-foreground">5-10 coins per active participation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-sm">🎨</span>
                    </div>
                    <div>
                      <div className="font-medium">EmotionCraft</div>
                      <div className="text-sm text-muted-foreground">10-20 coins per completed session</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium">XP Game Participation</div>
                      <div className="text-sm text-muted-foreground">Bonus coins for consistent engagement</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>📋 AgentVault™ Auction Rules</CardTitle>
              <CardDescription>How the Giftverse Mastermind AI auction system works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🎯 Bidding Rules</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Only team admins/leads may submit bids</li>
                    <li>• Teams can edit their bid anytime before auction close</li>
                    <li>• Bid must exceed current highest bid by at least 1 coin</li>
                    <li>• Once auction ends, no editing or refunds allowed</li>
                    <li>• Ties go to first team that placed the bid</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">⏰ Auction Cycle</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Auction runs for 7 days once per season (every 28 days)</li>
                    <li>• 15 gifts rotate per season across 3 tiers</li>
                    <li>• Real-time leaderboard updates every 15 seconds</li>
                    <li>• Highest bidder at close wins the reward</li>
                    <li>• 21-day cooldown between auction cycles</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🪙 VibeCoins System</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Shared team currency earned through XP games</li>
                    <li>• Each team has one combined coin balance</li>
                    <li>• Coins are spent on bids, not refunded for losses</li>
                    <li>• Penalty system for invalid bid attempts</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🏆 Reward Tiers</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • 🟢 <strong>Common:</strong> XP boosts, team perks
                    </li>
                    <li>
                      • 🟡 <strong>Uncommon:</strong> Premium experiences, swag
                    </li>
                    <li>
                      • 🔵 <strong>Rare:</strong> Executive access, major rewards
                    </li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Only teams that meet minimum XP or event participation criteria may join
                  the auction. View-only access is granted to all logged-in users.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bid Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {selectedItem.currentWinner?.team_name === mockTeam.name ? "Edit Your Bid" : "Place Bid"}
              </CardTitle>
              <CardDescription>
                📦 <strong>{selectedItem.title}</strong>
                <br />
                {selectedItem.tier_emoji} {selectedItem.tier.charAt(0).toUpperCase() + selectedItem.tier.slice(1)} Tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Giftverse Mastermind AI Response Format */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border">
                <div className="text-sm font-mono space-y-1">
                  <div>
                    📦 <strong>AUCTION ITEM PREVIEW:</strong>
                  </div>
                  <div>
                    <strong>Title:</strong> {selectedItem.title}
                  </div>
                  <div>
                    <strong>Tier:</strong> {selectedItem.tier_emoji} {selectedItem.tier}
                  </div>
                  <div>
                    <strong>Current Top Bid:</strong> {selectedItem.current_top_bid || selectedItem.starting_bid} by{" "}
                    {selectedItem.current_top_team_name || "No bids yet"}
                  </div>
                  <div>
                    <strong>Time Remaining:</strong>{" "}
                    {auctionStatus?.timeRemaining ? formatTimeRemaining(auctionStatus.timeRemaining) : "Unknown"}
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Current Top Bid:</span>
                  <span className="font-bold">{selectedItem.current_top_bid || selectedItem.starting_bid} coins</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Your Team Balance:</span>
                  <span className="font-bold text-yellow-500">{teamCoins?.balance || 0} coins</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Bid:</span>
                  <span className="font-bold text-green-500">
                    {(selectedItem.current_top_bid || selectedItem.starting_bid) + 1} coins
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bid Amount</label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ${(selectedItem.current_top_bid || selectedItem.starting_bid) + 1}`}
                  min={(selectedItem.current_top_bid || selectedItem.starting_bid) + 1}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Team Message (Optional)</label>
                <Textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Add a message with your bid..."
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <div className="font-medium mb-1">🎯 ACTIONS:</div>
                <div className="space-y-1 text-xs">
                  <div>• [Submit New Bid] - Place or update your team's bid</div>
                  <div>• [View Team Leaderboard] - See all current bids</div>
                  <div>• 🔁 You may update your bid at any time before the auction closes</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setSelectedItem(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={placeBid}
                  disabled={
                    bidding ||
                    !bidAmount ||
                    Number.parseInt(bidAmount) <= (selectedItem.current_top_bid || selectedItem.starting_bid)
                  }
                  className="flex-1"
                >
                  {bidding
                    ? "Processing..."
                    : selectedItem.currentWinner?.team_name === mockTeam.name
                      ? "Update Bid"
                      : "Place Bid"}
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                🕛 Auction ends:{" "}
                {auctionStatus?.timeRemaining
                  ? new Date(Date.now() + auctionStatus.timeRemaining).toLocaleString()
                  : "Unknown"}{" "}
                ET
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

