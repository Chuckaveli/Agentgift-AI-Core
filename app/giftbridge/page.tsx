"use client"

import { useState } from "react"
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

const mockNominations: Nomination[] = [
  {
    id: "1",
    recipientName: "Maria Santos",
    country: "Brazil",
    state: "São Paulo",
    story:
      "Single mother of three working two jobs to support her family. Recently lost her home in floods and is rebuilding from scratch with incredible strength and determination.",
    wishlist: ["School supplies for children", "Winter clothing", "Basic household items"],
    nominatorName: "Ana Rodriguez",
    votes: 1247,
    status: "approved",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    recipientName: "James Mitchell",
    country: "United States",
    state: "Ohio",
    story:
      "Veteran struggling with PTSD who volunteers at local animal shelter despite personal challenges. His dedication to helping abandoned animals is truly inspiring.",
    wishlist: ["Apartment security deposit", "Professional work clothes", "Therapy sessions"],
    nominatorName: "Sarah Johnson",
    votes: 892,
    status: "approved",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    recipientName: "Yuki Tanaka",
    country: "Japan",
    story:
      "Elderly man who lost his wife and now spends his days feeding stray cats in his neighborhood. His kindness touches everyone who meets him.",
    wishlist: ["Cat food and supplies", "Warm blankets", "Medical check-up"],
    nominatorName: "Hiroshi Sato",
    votes: 2156,
    status: "finalist",
    createdAt: "2024-01-10",
  },
]

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
  const [isLocked] = useState(true) // Coming 2026
  const [nominations] = useState<Nomination[]>(mockNominations)
  const [selectedCountry, setSelectedCountry] = useState("United States") // Updated default value
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [isNominationDialogOpen, setIsNominationDialogOpen] = useState(false)
  const [nominationForm, setNominationForm] = useState({
    recipientName: "",
    country: "",
    state: "",
    story: "",
    wishlist: "",
    nominatorName: "",
  })

  const handleVote = async (nominationId: string) => {
    if (userVotes.includes(nominationId)) return

    setUserVotes((prev) => [...prev, nominationId])
    // In real app, make API call and award 500 XP
    console.log(`Voted for nomination ${nominationId}, awarded 500 XP`)
  }

  const handleSubmitNomination = async () => {
    // In real app, deduct 20 credits and submit nomination
    console.log("Nomination submitted:", nominationForm)
    console.log("Deducted 20 credits")
    setIsNominationDialogOpen(false)
    setNominationForm({
      recipientName: "",
      country: "",
      state: "",
      story: "",
      wishlist: "",
      nominatorName: "",
    })
  }

  const filteredNominations = selectedCountry ? nominations.filter((n) => n.country === selectedCountry) : nominations

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
          "Community voting with 500 XP rewards per season",
          "Monthly country winners receive real gifts",
          "Annual $10,000 global finale with live voting",
          "Voice + video nomination support",
          "AI-powered story validation",
          "Cultural adaptation for global reach",
          "Seasonal themed campaigns",
        ]}
        mockupContent={
          <div className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.totalNominations}</div>
                <div className="text-sm text-white/80">Nominations</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.totalVotes.toLocaleString()}</div>
                <div className="text-sm text-white/80">Community Votes</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.countries}</div>
                <div className="text-sm text-white/80">Countries</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.finalists}</div>
                <div className="text-sm text-white/80">Finalists</div>
              </div>
            </div>

            {/* Sample Nominations */}
            <div className="space-y-4">
              {topNominations.slice(0, 2).map((nomination) => (
                <div key={nomination.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-white/20 text-white">{nomination.recipientName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{nomination.recipientName}</h3>
                        <Badge className="bg-white/20 text-white text-xs">{nomination.country}</Badge>
                      </div>
                      <p className="text-white/80 text-sm mb-2 line-clamp-2">{nomination.story}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Vote className="w-3 h-3" />
                          {nomination.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {nomination.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                    <CardDescription>Vote for inspiring stories from around the world</CardDescription>
                  </div>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem> // Updated value prop
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
                                Voted (+500 XP)
                              </>
                            ) : (
                              <>
                                <Heart className="w-4 h-4 mr-2" />
                                Vote (+500 XP)
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${nomination.recipientName[0]}`} />
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
                  Nominate someone deserving for a chance to receive a meaningful gift (Costs 20 credits)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isNominationDialogOpen} onOpenChange={setIsNominationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Nomination (20 Credits)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit a Nomination</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recipientName">Recipient Name</Label>
                          <Input
                            id="recipientName"
                            value={nominationForm.recipientName}
                            onChange={(e) => setNominationForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                            placeholder="Who are you nominating?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nominatorName">Your Name</Label>
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
                          <Label htmlFor="country">Country</Label>
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
                        <Label htmlFor="story">Their Story</Label>
                        <Textarea
                          id="story"
                          value={nominationForm.story}
                          onChange={(e) => setNominationForm((prev) => ({ ...prev, story: e.target.value }))}
                          placeholder="Tell us why this person deserves to be nominated. What makes their story special?"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="wishlist">Wishlist (comma-separated)</Label>
                        <Textarea
                          id="wishlist"
                          value={nominationForm.wishlist}
                          onChange={(e) => setNominationForm((prev) => ({ ...prev, wishlist: e.target.value }))}
                          placeholder="What would help them most? e.g., School supplies, Winter clothing, Medical bills"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSubmitNomination} className="flex-1">
                          <Send className="w-4 h-4 mr-2" />
                          Submit Nomination (20 Credits)
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
                    <li>• Submit nominations for 20 credits each</li>
                    <li>• Community votes on the most inspiring stories</li>
                    <li>• Earn 500 XP for each vote (one vote per season)</li>
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
