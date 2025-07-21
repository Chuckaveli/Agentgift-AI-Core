"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Globe,
  Users,
  Vote,
  Trophy,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Crown,
  Calendar,
  MapPin,
  Gift,
  TrendingUp,
  AlertCircle,
  FileText,
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
  status: "pending" | "approved" | "finalist" | "winner" | "rejected"
  createdAt: string
  adminNotes?: string
}

interface AdminStats {
  totalNominations: number
  pendingReview: number
  approved: number
  finalists: number
  winners: number
  totalVotes: number
  countriesActive: number
}

const mockNominations: Nomination[] = [
  {
    id: "1",
    recipientName: "Maria Santos",
    country: "Brazil",
    state: "São Paulo",
    story:
      "Single mother of three working two jobs to support her family. Recently lost her home in floods and is rebuilding from scratch.",
    wishlist: ["School supplies", "Winter clothing", "Basic household items"],
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
    story: "Veteran struggling with PTSD who volunteers at local animal shelter despite personal challenges.",
    wishlist: ["Apartment deposit", "Work clothes", "Therapy sessions"],
    nominatorName: "Sarah Johnson",
    votes: 892,
    status: "pending",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    recipientName: "Yuki Tanaka",
    country: "Japan",
    story: "Elderly man who lost his wife and now spends his days feeding stray cats in his neighborhood.",
    wishlist: ["Cat food", "Warm blankets", "Medical check-up"],
    nominatorName: "Hiroshi Sato",
    votes: 2156,
    status: "finalist",
    createdAt: "2024-01-10",
  },
  {
    id: "4",
    recipientName: "Emma Thompson",
    country: "United Kingdom",
    story: "Teacher who started a free after-school program for underprivileged children.",
    wishlist: ["Educational materials", "Art supplies", "Healthy snacks"],
    nominatorName: "David Wilson",
    votes: 634,
    status: "pending",
    createdAt: "2024-01-22",
  },
]

export default function GiftBridgeAdminPage() {
  const { toast } = useToast()
  const [nominations, setNominations] = useState<Nomination[]>(mockNominations)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  const stats: AdminStats = {
    totalNominations: nominations.length,
    pendingReview: nominations.filter((n) => n.status === "pending").length,
    approved: nominations.filter((n) => n.status === "approved").length,
    finalists: nominations.filter((n) => n.status === "finalist").length,
    winners: nominations.filter((n) => n.status === "winner").length,
    totalVotes: nominations.reduce((sum, n) => sum + n.votes, 0),
    countriesActive: new Set(nominations.map((n) => n.country)).size,
  }

  const filteredNominations = nominations.filter((nomination) => {
    const statusMatch = selectedStatus === "all" || nomination.status === selectedStatus
    const countryMatch = selectedCountry === "all" || nomination.country === selectedCountry
    return statusMatch && countryMatch
  })

  const countries = Array.from(new Set(nominations.map((n) => n.country))).sort()

  const handleStatusChange = async (nominationId: string, newStatus: string, notes = "") => {
    try {
      setNominations((prev) =>
        prev.map((nom) => (nom.id === nominationId ? { ...nom, status: newStatus as any, adminNotes: notes } : nom)),
      )

      toast({
        title: "Status Updated",
        description: `Nomination status changed to ${newStatus}`,
      })

      setIsReviewDialogOpen(false)
      setSelectedNomination(null)
      setAdminNotes("")
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update nomination status",
        variant: "destructive",
      })
    }
  }

  const openReviewDialog = (nomination: Nomination) => {
    setSelectedNomination(nomination)
    setAdminNotes(nomination.adminNotes || "")
    setIsReviewDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "finalist":
        return "bg-purple-100 text-purple-800"
      case "winner":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "finalist":
        return <Star className="w-4 h-4" />
      case "winner":
        return <Crown className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GiftBridge™ Admin</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage global nominations and voting</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalNominations}</div>
              <div className="text-xs text-gray-500">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-xs text-gray-500">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.finalists}</div>
              <div className="text-xs text-gray-500">Finalists</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.winners}</div>
              <div className="text-xs text-gray-500">Winners</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Vote className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.countriesActive}</div>
              <div className="text-xs text-gray-500">Countries</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nominations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nominations">Manage Nominations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
          </TabsList>

          <TabsContent value="nominations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nomination Management</CardTitle>
                    <CardDescription>Review and manage community nominations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="finalist">Finalist</SelectItem>
                        <SelectItem value="winner">Winner</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="w-40">
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                            <Badge className={`${getStatusColor(nomination.status)} flex items-center gap-1`}>
                              {getStatusIcon(nomination.status)}
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

                        {nomination.adminNotes && (
                          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes:</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{nomination.adminNotes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Nominated by: <span className="font-medium">{nomination.nominatorName}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openReviewDialog(nomination)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                            {nomination.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(nomination.id, "approved")}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleStatusChange(nomination.id, "rejected")}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {nomination.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(nomination.id, "finalist")}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Make Finalist
                              </Button>
                            )}
                            {nomination.status === "finalist" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(nomination.id, "winner")}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                <Crown className="w-4 h-4 mr-2" />
                                Select Winner
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Voting Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Votes Cast</span>
                      <span className="font-bold">{stats.totalVotes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Votes per Nomination</span>
                      <span className="font-bold">{Math.round(stats.totalVotes / stats.totalNominations)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Countries Participating</span>
                      <span className="font-bold">{stats.countriesActive}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {countries.slice(0, 5).map((country, index) => {
                      const countryNominations = nominations.filter((n) => n.country === country).length
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm">{country}</span>
                          </div>
                          <span className="font-bold">{countryNominations}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="winners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Season Winners
                </CardTitle>
                <CardDescription>Current and past winners by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nominations
                    .filter((n) => n.status === "winner" || n.status === "finalist")
                    .sort((a, b) => b.votes - a.votes)
                    .map((winner, index) => (
                      <div
                        key={winner.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                          {winner.status === "winner" ? (
                            <Crown className="w-6 h-6 text-white" />
                          ) : (
                            <Star className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${winner.recipientName[0]}`} />
                          <AvatarFallback>{winner.recipientName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{winner.recipientName}</h3>
                            <Badge className={getStatusColor(winner.status)}>
                              {winner.status === "winner" ? "Winner" : "Finalist"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {winner.country} • {winner.votes.toLocaleString()} votes
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {winner.status === "winner" ? "🏆 Global Winner" : "⭐ Finalist"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Nomination</DialogTitle>
            </DialogHeader>
            {selectedNomination && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Recipient</Label>
                    <div className="font-medium">{selectedNomination.recipientName}</div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <div className="font-medium">
                      {selectedNomination.country}
                      {selectedNomination.state && `, ${selectedNomination.state}`}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Story</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-1">{selectedNomination.story}</div>
                </div>

                <div>
                  <Label>Wishlist</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedNomination.wishlist.map((item, index) => (
                      <Badge key={index} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Current Status</Label>
                  <Badge className={`${getStatusColor(selectedNomination.status)} mt-1`}>
                    {selectedNomination.status}
                  </Badge>
                </div>

                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this nomination..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  {selectedNomination.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(selectedNomination.id, "approved", adminNotes)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusChange(selectedNomination.id, "rejected", adminNotes)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedNomination.status === "approved" && (
                    <Button
                      onClick={() => handleStatusChange(selectedNomination.id, "finalist", adminNotes)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Make Finalist
                    </Button>
                  )}
                  {selectedNomination.status === "finalist" && (
                    <Button
                      onClick={() => handleStatusChange(selectedNomination.id, "winner", adminNotes)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Select Winner
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
