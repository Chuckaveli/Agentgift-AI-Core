"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Trophy,
  Crown,
  Gift,
  Users,
  Download,
  Mail,
  Search,
  MoreHorizontal,
  AwardIcon,
  Zap,
  Heart,
  Star,
  TrendingUp,
  FileText,
  Video,
  BadgeIcon,
  Utensils,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface Participant {
  user_id: string
  username: string
  xp_total: number
  total_game_actions: number
  last_qualifying_action: string
  lunch_drop_qualified: boolean
  award_tier: string
  created_at: string
  updated_at: string
}

interface Summary {
  total_participants: number
  lunch_qualified: number
  tier_breakdown: {
    Platinum: number
    Gold: number
    Silver: number
    Bronze: number
    Novice: number
  }
}

interface LunchDrop {
  id: string
  user_id: string
  drop_type: string
  webhook_status: string
  created_at: string
  user_profiles: { email: string }
  triggered_by_profile: { email: string }
}

interface Award {
  id: string
  user_profiles: { email: string }
  award_type: string
  award_period: string
  status: string
  awarded_at: string
}

export default function GreatSamaritanTracker() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [lunchDrops, setLunchDrops] = useState<LunchDrop[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [sortBy, setSortBy] = useState("total_game_actions")
  const [sortOrder, setSortOrder] = useState("desc")

  // Award dialog state
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [awardType, setAwardType] = useState("monthly_lunch")
  const [awardPeriod, setAwardPeriod] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [bonusRewards, setBonusRewards] = useState<string[]>([])

  // Lunch drop dialog state
  const [lunchDropDialogOpen, setLunchDropDialogOpen] = useState(false)
  const [selectedUserForLunch, setSelectedUserForLunch] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

  useEffect(() => {
    fetchData()
  }, [searchTerm, tierFilter, sortBy, sortOrder])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch participants
      const participantsUrl = new URL("/api/admin/great-samaritan/participants", window.location.origin)
      participantsUrl.searchParams.set("sortBy", sortBy)
      participantsUrl.searchParams.set("sortOrder", sortOrder)
      if (tierFilter !== "all") participantsUrl.searchParams.set("filterTier", tierFilter)
      if (searchTerm) participantsUrl.searchParams.set("search", searchTerm)

      const participantsRes = await fetch(participantsUrl)
      const participantsData = await participantsRes.json()

      if (participantsRes.ok) {
        setParticipants(participantsData.participants)
        setSummary(participantsData.summary)
      }

      // Fetch recent awards
      const awardsRes = await fetch("/api/admin/great-samaritan/awards")
      const awardsData = await awardsRes.json()
      if (awardsRes.ok) {
        setAwards(awardsData.awards)
      }

      // Fetch recent lunch drops
      const lunchRes = await fetch("/api/admin/great-samaritan/lunch-drop")
      const lunchData = await lunchRes.json()
      if (lunchRes.ok) {
        setLunchDrops(lunchData.lunch_drops.slice(0, 10)) // Latest 10
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAward = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user")
      return
    }

    try {
      const response = await fetch("/api/admin/great-samaritan/awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          award_type: awardType,
          user_ids: selectedUsers,
          award_period: awardPeriod,
          admin_id: "current-admin-id", // TODO: Get from auth context
          bonus_rewards: bonusRewards,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setAwardDialogOpen(false)
        setSelectedUsers([])
        setBonusRewards([])
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error creating award:", error)
      toast.error("Failed to create award")
    }
  }

  const handleTriggerLunchDrop = async () => {
    if (!selectedUserForLunch) {
      toast.error("Please select a user")
      return
    }

    try {
      const response = await fetch("/api/admin/great-samaritan/lunch-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserForLunch,
          admin_id: "current-admin-id", // TODO: Get from auth context
          webhook_url: webhookUrl || undefined,
          delivery_notes: deliveryNotes || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setLunchDropDialogOpen(false)
        setSelectedUserForLunch("")
        setWebhookUrl("")
        setDeliveryNotes("")
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error triggering lunch drop:", error)
      toast.error("Failed to trigger lunch drop")
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Bronze":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return <Crown className="w-4 h-4" />
      case "Gold":
        return <Trophy className="w-4 h-4" />
      case "Silver":
        return <AwardIcon className="w-4 h-4" />
      case "Bronze":
        return <Star className="w-4 h-4" />
      default:
        return <BadgeIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            The Great Samaritan Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Internal admin system for tracking and rewarding top contributors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_participants.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lunch Drop Qualified</CardTitle>
              <Utensils className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.lunch_qualified}</div>
              <p className="text-xs text-muted-foreground">1,000+ actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platinum Tier</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary.tier_breakdown.Platinum}</div>
              <p className="text-xs text-muted-foreground">5,000+ actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gold Tier</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.tier_breakdown.Gold}</div>
              <p className="text-xs text-muted-foreground">2,500+ actions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              Monthly Lunch Drop
            </CardTitle>
            <CardDescription>Trigger surprise lunch drops for qualified users</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={lunchDropDialogOpen} onOpenChange={setLunchDropDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Gift className="w-4 h-4 mr-2" />
                  Trigger Lunch Drop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Trigger Lunch Drop</DialogTitle>
                  <DialogDescription>Send a surprise lunch drop to a qualified user</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select User</label>
                    <Select value={selectedUserForLunch} onValueChange={setSelectedUserForLunch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a qualified user" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants
                          .filter((p) => p.lunch_drop_qualified)
                          .map((participant) => (
                            <SelectItem key={participant.user_id} value={participant.user_id}>
                              {participant.username} ({participant.total_game_actions} actions)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Webhook URL (Optional)</label>
                    <Input
                      placeholder="https://your-webhook-url.com"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivery Notes</label>
                    <Textarea
                      placeholder="Special instructions or notes..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLunchDropDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTriggerLunchDrop}>Trigger Drop</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Annual Awards
            </CardTitle>
            <CardDescription>Create Great Samaritan awards for top contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-transparent" variant="outline">
                  <AwardIcon className="w-4 h-4 mr-2" />
                  Create Awards
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Great Samaritan Awards</DialogTitle>
                  <DialogDescription>Award top contributors with recognition and bonus rewards</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Award Type</label>
                      <Select value={awardType} onValueChange={setAwardType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly_lunch">Monthly Lunch Winner</SelectItem>
                          <SelectItem value="annual_winner">Annual Great Samaritan</SelectItem>
                          <SelectItem value="annual_runner_up">Annual Runner-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Award Period</label>
                      <Input type="month" value={awardPeriod} onChange={(e) => setAwardPeriod(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bonus Rewards</label>
                    <div className="space-y-2 mt-2">
                      {[
                        { id: "heygen_film", label: "🎥 HeyGen Short Film", icon: Video },
                        { id: "beta_access", label: "🎟️ Beta Access Badge", icon: Zap },
                        { id: "legacy_badge", label: "👑 Legacy Badge: Hearts & Hustle", icon: Crown },
                      ].map((reward) => (
                        <div key={reward.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={reward.id}
                            checked={bonusRewards.includes(reward.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBonusRewards([...bonusRewards, reward.id])
                              } else {
                                setBonusRewards(bonusRewards.filter((r) => r !== reward.id))
                              }
                            }}
                          />
                          <label htmlFor={reward.id} className="text-sm flex items-center gap-2">
                            <reward.icon className="w-4 h-4" />
                            {reward.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Selected Users ({selectedUsers.length})</label>
                    <p className="text-xs text-muted-foreground">Select users from the table below to award</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAwardDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAward} disabled={selectedUsers.length === 0}>
                    Create Awards ({selectedUsers.length})
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Auto Summary
            </CardTitle>
            <CardDescription>Generate monthly reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participant Tracker
          </CardTitle>
          <CardDescription>Track and manage all Great Samaritan participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Novice">Novice</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-")
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_game_actions-desc">Actions (High to Low)</SelectItem>
                <SelectItem value="total_game_actions-asc">Actions (Low to High)</SelectItem>
                <SelectItem value="xp_total-desc">XP (High to Low)</SelectItem>
                <SelectItem value="xp_total-asc">XP (Low to High)</SelectItem>
                <SelectItem value="username-asc">Username (A-Z)</SelectItem>
                <SelectItem value="username-desc">Username (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Participants Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedUsers.length === participants.length && participants.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(participants.map((p) => p.user_id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>XP Total</TableHead>
                  <TableHead>Game Actions</TableHead>
                  <TableHead>Last Action</TableHead>
                  <TableHead>Lunch Qualified</TableHead>
                  <TableHead>Award Tier</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.user_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(participant.user_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, participant.user_id])
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== participant.user_id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{participant.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {participant.xp_total.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        {participant.total_game_actions.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {participant.last_qualifying_action
                        ? new Date(participant.last_qualifying_action).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {participant.lunch_drop_qualified ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Qualified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Not Yet
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierBadgeColor(participant.award_tier)}>
                        {getTierIcon(participant.award_tier)}
                        <span className="ml-1">{participant.award_tier}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserForLunch(participant.user_id)
                              setLunchDropDialogOpen(true)
                            }}
                            disabled={!participant.lunch_drop_qualified}
                          >
                            <Utensils className="mr-2 h-4 w-4" />
                            Trigger Lunch Drop
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AwardIcon className="mr-2 h-4 w-4" />
                            Create Award
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Awards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Recent Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for recent awards data */}
              {awards.map((award) => (
                <div key={award.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{award.user_profiles.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {award.award_type.replace("_", " ")} • {award.award_period}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={award.status === "active" ? "default" : "secondary"}>{award.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(award.awarded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {awards.length === 0 && <p className="text-center text-muted-foreground py-4">No awards created yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Lunch Drops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              Recent Lunch Drops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for recent lunch drops data */}
              {lunchDrops.map((drop) => (
                <div key={drop.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{drop.user_profiles.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {drop.drop_type.replace("_", " ")} • by {drop.triggered_by_profile.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        drop.webhook_status === "sent"
                          ? "default"
                          : drop.webhook_status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {drop.webhook_status === "sent" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {drop.webhook_status === "failed" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {drop.webhook_status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {drop.webhook_status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(drop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {lunchDrops.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No lunch drops triggered yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

