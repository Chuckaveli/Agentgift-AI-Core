"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Globe,
  Users,
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  TrendingUp,
  Award,
} from "lucide-react"

interface AdminNomination {
  id: string
  recipientName: string
  country: string
  state?: string
  story: string
  wishlist: string[]
  nominatorName: string
  status: "pending" | "approved" | "finalist" | "winner"
  votes: number
  createdAt: string
  adminNotes?: string
}

const mockAdminNominations: AdminNomination[] = [
  {
    id: "1",
    recipientName: "Maria Santos",
    country: "Brazil",
    state: "São Paulo",
    story:
      "Single mother of three working two jobs to support her family. Recently lost her home in floods and is rebuilding from scratch.",
    wishlist: ["School supplies", "Winter clothing", "Basic household items"],
    nominatorName: "Ana Rodriguez",
    status: "pending",
    votes: 0,
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
    status: "approved",
    votes: 892,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    recipientName: "Yuki Tanaka",
    country: "Japan",
    story: "Elderly man who lost his wife and now spends his days feeding stray cats in his neighborhood.",
    wishlist: ["Cat food", "Warm blankets", "Medical supplies"],
    nominatorName: "Hiroshi Sato",
    status: "finalist",
    votes: 1247,
    createdAt: "2024-01-10",
  },
]

export default function GiftBridgeAdminPage() {
  const [nominations, setNominations] = useState<AdminNomination[]>(mockAdminNominations)
  const [selectedNomination, setSelectedNomination] = useState<AdminNomination | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)

  const handleStatusChange = async (nominationId: string, newStatus: AdminNomination["status"]) => {
    setNominations((prev) => prev.map((nom) => (nom.id === nominationId ? { ...nom, status: newStatus } : nom)))

    // In real app, make API call here
    console.log(`Updated nomination ${nominationId} to status: ${newStatus}`)
  }

  const handleAddNotes = async () => {
    if (!selectedNomination) return

    setNominations((prev) =>
      prev.map((nom) => (nom.id === selectedNomination.id ? { ...nom, adminNotes: adminNotes } : nom)),
    )

    setAdminNotes("")
    setSelectedNomination(null)
    setIsNotesDialogOpen(false)

    // In real app, make API call here
    console.log(`Added notes to nomination ${selectedNomination.id}: ${adminNotes}`)
  }

  const getStatusColor = (status: AdminNomination["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "finalist":
        return "bg-purple-100 text-purple-800"
      case "winner":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredNominations = nominations.filter((nom) => filterStatus === "all" || nom.status === filterStatus)

  const stats = {
    totalNominations: nominations.length,
    pendingReview: nominations.filter((n) => n.status === "pending").length,
    approved: nominations.filter((n) => n.status === "approved").length,
    finalists: nominations.filter((n) => n.status === "finalist").length,
    winners: nominations.filter((n) => n.status === "winner").length,
    totalVotes: nominations.reduce((sum, n) => sum + n.votes, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">GiftBridge™ Admin</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage global nominations and voting</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalNominations}</div>
              <div className="text-sm text-gray-500">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.finalists}</div>
              <div className="text-sm text-gray-500">Finalists</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.winners}</div>
              <div className="text-sm text-gray-500">Winners</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Vote className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalVotes}</div>
              <div className="text-sm text-gray-500">Total Votes</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nominations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nominations">Nominations</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
          </TabsList>

          <TabsContent value="nominations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nomination Review</CardTitle>
                    <CardDescription>Review and approve submitted nominations</CardDescription>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="finalist">Finalist</SelectItem>
                      <SelectItem value="winner">Winner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNominations.map((nomination) => (
                    <Card key={nomination.id} className="border-2">
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
                            <Badge className={getStatusColor(nomination.status)}>{nomination.status}</Badge>
                            <div className="text-sm text-gray-500 mt-1">{nomination.votes} votes</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Story:</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{nomination.story}</p>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Wishlist:</h4>
                          <div className="flex flex-wrap gap-2">
                            {nomination.wishlist.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-500">
                            Nominated by: <span className="font-medium">{nomination.nominatorName}</span>
                          </div>
                        </div>

                        {nomination.adminNotes && (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">Admin Notes:</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{nomination.adminNotes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {nomination.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(nomination.id, "approved")}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(nomination.id, "pending")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
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
                              <Star className="w-4 h-4 mr-1" />
                              Make Finalist
                            </Button>
                          )}

                          {nomination.status === "finalist" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(nomination.id, "winner")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Crown className="w-4 h-4 mr-1" />
                              Select Winner
                            </Button>
                          )}

                          <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedNomination(nomination)
                                  setAdminNotes(nomination.adminNotes || "")
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Add Notes
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Admin Notes</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Adding notes for: <strong>{selectedNomination?.recipientName}</strong>
                                  </p>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Enter admin notes..."
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleAddNotes}>Save Notes</Button>
                                  <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voting Analytics</CardTitle>
                <CardDescription>Monitor community voting patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Voting Analytics Dashboard</h3>
                  <p>Real-time voting metrics and community engagement data coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="winners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Winners Gallery</CardTitle>
                <CardDescription>Celebrate our GiftBridge winners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Winners Showcase</h3>
                  <p>Winner profiles and success stories will be displayed here...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
