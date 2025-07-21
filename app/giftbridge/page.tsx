"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LockedPreview } from "@/components/global/locked-preview"
import { useToast } from "@/hooks/use-toast"
import {
  Globe,
  Heart,
  Users,
  Vote,
  Gift,
  MapPin,
  Calendar,
  Star,
  Crown,
  Plus,
  Send,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle,
  Coins,
} from "lucide-react"

interface Nomination {
  id: string
  recipientName: string
  country: string
  state?: string
  story: string
  wishlist: string[]
  nominatorName: string
  votes: number
  status: "pending" | "approved" | "finalist" | "winner"
  createdAt: string
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "India",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
]

export default function GiftBridgePage() {
  const { toast } = useToast()
  const [isLocked] = useState(false) // Set to false for testing
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [userCredits, setUserCredits] = useState(150) // Mock user credits
  const [userXP, setUserXP] = useState(2500) // Mock user XP
  const [isNominationDialogOpen, setIsNominationDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [nominationForm, setNominationForm] = useState({
    recipientName: "",
    country: "",
    state: "",
    story: "",
    wishlist: "",
    nominatorName: "",
  })

  // Load nominations on component mount
  useEffect(() => {
    loadNominations()
    loadUserVotes()
  }, [selectedCountry])

  const loadNominations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCountry && selectedCountry !== "all") {
        params.append("country", selectedCountry)
      }
      params.append("status", "approved")

      const response = await fetch(`/api/giftbridge/nominations?${params}`)
      const data = await response.json()

      if (data.success) {
        setNominations(data.nominations)
      } else {
        toast({
          title: "Error",
          description: "Failed to load nominations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading nominations:", error)
      toast({
        title: "Error",
        description: "Failed to load nominations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserVotes = async () => {
    try {
      const response = await fetch(`/api/giftbridge/votes?userId=mock-user-123`)
      const data = await response.json()

      if (data.success) {
        setUserVotes(data.votes)
      }
    } catch (error) {
      console.error("Error loading user votes:", error)
    }
  }

  const handleVote = async (nominationId: string) => {
    if (userVotes.includes(nominationId)) {
      toast({
        title: "Already Voted",
        description: "You have already voted for this nomination this season",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/giftbridge/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nominationId,
          userId: "mock-user-123",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserVotes((prev) => [...prev, nominationId])
        setUserXP((prev) => prev + 50) // Correct XP amount

        // Update nomination vote count locally
        setNominations((prev) => prev.map((nom) => (nom.id === nominationId ? { ...nom, votes: nom.votes + 1 } : nom)))

        toast({
          title: "Vote Recorded!",
          description: "You earned 50 XP for voting! 🎉",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to record vote",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      })
    }
  }

  const handleSubmitNomination = async () => {
    if (userCredits < 20) {
      toast({
        title: "Insufficient Credits",
        description: "You need 20 credits to submit a nomination",
        variant: "destructive",
      })
      return
    }

    if (
      !nominationForm.recipientName ||
      !nominationForm.country ||
      !nominationForm.story ||
      !nominationForm.nominatorName
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch("/api/giftbridge/nominations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nominationForm,
          userId: "mock-user-123",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserCredits((prev) => prev - 20)
        setUserXP((prev) => prev + 100) // Correct XP amount

        // Reset form
        setNominationForm({
          recipientName: "",
          country: "",
          state: "",
          story: "",
          wishlist: "",
          nominatorName: "",
        })

        setIsNominationDialogOpen(false)

        toast({
          title: "Nomination Submitted!",
          description: "You earned 100 XP and spent 20 credits! 🎉",
        })

        // Reload nominations
        loadNominations()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit nomination",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting nomination:", error)
      toast({
        title: "Error",
        description: "Failed to submit nomination",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredNominations =
    selectedCountry === "all" ? nominations : nominations.filter((n) => n.country === selectedCountry)

  const topNominations = [...filteredNominations].sort((a, b) => b.votes - a.votes).slice(0, 3)

  const stats = {
    totalNominations: nominations.length,
    totalVotes: nominations.reduce((sum, n) => sum + n.votes, 0),
    countries: new Set(nominations.map((n) => n.country)).size,
    finalists: nominations.filter((n) => n.status === "finalist").length,
  }

  if (isLocked) {
    return (
      <LockedPreview
        title="GiftBridge™"
        subtitle="One World, One Gift at a Time™"
        description="A global nomination and voting system where communities come together to support those who need it most. Submit meaningful nominations, vote for inspiring stories, and help create real change in people's lives."
        comingSoon="Coming 2026"
        features={[
          "Global nomination system with 20 credit entry fee",
          "Community voting with 50 XP rewards per vote",
          "100 XP bonus for submitting nominations",
          "Monthly country winners receive real gifts",
          "Annual $10,000 global finale with live voting",
          "Voice + video nomination support",
          "AI-powered story validation",
          "Cultural adaptation for global reach",
        ]}
        mockupContent={
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-white/80">Nominations</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">89,234</div>
                <div className="text-sm text-white/80">Community Votes</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">67</div>
                <div className="text-sm text-white/80">Countries</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-white/80">Finalists</div>
              </div>
            </div>
          </div>
        }
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                GiftBridge™
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">One World, One Gift at a Time™</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Connect hearts across borders. Nominate deserving individuals, vote for inspiring stories, and help create
            meaningful change in communities worldwide.
          </p>
        </div>

        {/* User Stats */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">{userCredits} Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              <span className="font-medium">{userXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{userVotes.length} Votes Cast</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalNominations}</div>
              <div className="text-sm text-gray-500">Active Nominations</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Vote className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Community Votes</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Globe className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.countries}</div>
              <div className="text-sm text-gray-500">Countries</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.finalists}</div>
              <div className="text-sm text-gray-500">Finalists</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nominations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nominations">Browse Nominations</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="submit">Submit Nomination</TabsTrigger>
          </TabsList>

          <TabsContent value="nominations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Community Nominations</CardTitle>
                    <CardDescription>Vote for inspiring stories from around the world (50 XP per vote)</CardDescription>
                  </div>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading nominations...</p>
                  </div>
                ) : filteredNominations.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No nominations found for the selected filters.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredNominations.map((nomination) => (
                      <Card key={nomination.id} className="border-2 hover:border-purple-200 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage
                                  src={`/placeholder.svg?height=48&width=48&text=${nomination.recipientName[0]}`}
                                />
                                <AvatarFallback>{nomination.recipientName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-lg">{nomination.recipientName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <MapPin className="w-4 h-4" />
                                  {nomination.country}
                                  {nomination.state && `, ${nomination.state}`}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  {nomination.createdAt}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={
                                  nomination.status === "finalist"
                                    ? "bg-purple-100 text-purple-800"
                                    : nomination.status === "winner"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {nomination.status === "finalist" && <Star className="w-3 h-3 mr-1" />}
                                {nomination.status === "winner" && <Crown className="w-3 h-3 mr-1" />}
                                {nomination.status}
                              </Badge>
                              <div className="text-sm text-gray-500 mt-1">{nomination.votes} votes</div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{nomination.story}</p>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-sm">Wishlist:</h4>
                            <div className="flex flex-wrap gap-2">
                              {nomination.wishlist.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Gift className="w-3 h-3 mr-1" />
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Nominated by: <span className="font-medium">{nomination.nominatorName}</span>
                            </div>
                            <Button
                              onClick={() => handleVote(nomination.id)}
                              disabled={userVotes.includes(nomination.id)}
                              className={
                                userVotes.includes(nomination.id)
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-purple-600 hover:bg-purple-700"
                              }
                            >
                              {userVotes.includes(nomination.id) ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Voted (+50 XP)
                                </>
                              ) : (
                                <>
                                  <Heart className="w-4 h-4 mr-2" />
                                  Vote (+50 XP)
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>Top nominations by community votes</CardDescription>
              </CardHeader>
              <CardContent>
                {topNominations.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No nominations to display yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topNominations.map((nomination, index) => (
                      <div
                        key={nomination.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${nomination.recipientName[0]}`}
                          />
                          <AvatarFallback>{nomination.recipientName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{nomination.recipientName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {nomination.country}
                            </Badge>
                            {nomination.status === "finalist" && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Finalist
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{nomination.story}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{nomination.votes}</div>
                          <div className="text-sm text-gray-500">votes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Submit a Nomination
                </CardTitle>
                <CardDescription>
                  Nominate someone deserving for a chance to receive a meaningful gift (Costs 20 credits, earns 100 XP)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Your Credits: {userCredits}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Your XP: {userXP.toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge variant={userCredits >= 20 ? "default" : "destructive"}>
                    {userCredits >= 20 ? "Ready to Submit" : "Need More Credits"}
                  </Badge>
                </div>

                <Dialog open={isNominationDialogOpen} onOpenChange={setIsNominationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={userCredits < 20}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Nomination (20 Credits → 100 XP)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit a Nomination</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recipientName">Recipient Name *</Label>
                          <Input
                            id="recipientName"
                            value={nominationForm.recipientName}
                            onChange={(e) => setNominationForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                            placeholder="Who are you nominating?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nominatorName">Your Name *</Label>
                          <Input
                            id="nominatorName"
                            value={nominationForm.nominatorName}
                            onChange={(e) => setNominationForm((prev) => ({ ...prev, nominatorName: e.target.value }))}
                            placeholder="Your name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Select
                            value={nominationForm.country}
                            onValueChange={(value) => setNominationForm((prev) => ({ ...prev, country: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province (Optional)</Label>
                          <Input
                            id="state"
                            value={nominationForm.state}
                            onChange={(e) => setNominationForm((prev) => ({ ...prev, state: e.target.value }))}
                            placeholder="State or province"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="story">Their Story * (Max 500 characters)</Label>
                        <Textarea
                          id="story"
                          value={nominationForm.story}
                          onChange={(e) => setNominationForm((prev) => ({ ...prev, story: e.target.value }))}
                          placeholder="Tell us why this person deserves to be nominated. What makes their story special?"
                          rows={4}
                          maxLength={500}
                        />
                        <div className="text-sm text-gray-500 mt-1">{nominationForm.story.length}/500 characters</div>
                      </div>

                      <div>
                        <Label htmlFor="wishlist">Wishlist Items * (comma-separated)</Label>
                        <Textarea
                          id="wishlist"
                          value={nominationForm.wishlist}
                          onChange={(e) => setNominationForm((prev) => ({ ...prev, wishlist: e.target.value }))}
                          placeholder="What would help them most? e.g., School supplies, Winter clothing, Medical bills"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitNomination}
                          className="flex-1"
                          disabled={submitting || userCredits < 20}
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Nomination (-20 Credits, +100 XP)
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setIsNominationDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    How GiftBridge Works
                  </h3>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Submit nominations for 20 credits each (+100 XP)</li>
                    <li>• Community votes on the most inspiring stories (+50 XP per vote)</li>
                    <li>• One vote per user per season (quarterly seasons)</li>
                    <li>• Monthly winners from each country receive real gifts</li>
                    <li>• Annual global finale with $10,000 grand prize</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
