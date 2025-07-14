"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Instagram, Twitter, Music, ExternalLink, CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface SocialProofAdmin {
  id: string
  user_id: string
  user_name: string
  user_email: string
  platform: string
  post_url: string
  caption_text: string
  hashtags: string[]
  required_hashtags: string[]
  status: "pending" | "approved" | "rejected"
  xp_awarded: number
  admin_notes?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export default function SocialProofsAdmin() {
  const [submissions, setSubmissions] = useState<SocialProofAdmin[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<SocialProofAdmin | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/social-proofs")
      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast.error("Failed to fetch submissions")
    }
  }

  const handleReview = async (submissionId: string, action: "approve" | "reject") => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/social-proofs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          action,
          admin_notes: adminNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Submission ${action}d successfully`)
        setAdminNotes("")
        setSelectedSubmission(null)
        fetchSubmissions()
      } else {
        toast.error(data.error || `Failed to ${action} submission`)
      }
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error)
      toast.error(`Failed to ${action} submission`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "tiktok":
        return <Music className="w-4 h-4" />
      case "twitter":
        return <Twitter className="w-4 h-4" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending")
  const reviewedSubmissions = submissions.filter((s) => s.status !== "pending")

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Proof Admin Panel</h1>
        <p className="text-gray-600">Review and approve social media submissions from users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingSubmissions.length}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{submissions.filter((s) => s.status === "approved").length}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{submissions.filter((s) => s.status === "rejected").length}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingSubmissions.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewedSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-gray-600">No pending submissions to review.</p>
                </CardContent>
              </Card>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(submission.platform)}
                        <div>
                          <h3 className="font-medium">{submission.user_name}</h3>
                          <p className="text-sm text-gray-600">{submission.user_email}</p>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1 capitalize">{submission.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{new Date(submission.submitted_at).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <a
                          href={submission.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Original Post
                        </a>
                      </div>

                      {submission.caption_text && (
                        <div className="bg-gray-50 p-3 rounded">
                          <h4 className="font-medium mb-1">Caption:</h4>
                          <p className="text-sm">{submission.caption_text}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Hashtags Found:</h4>
                        <div className="flex flex-wrap gap-2">
                          {submission.hashtags.map((tag) => {
                            const isRequired = submission.required_hashtags.includes(tag)
                            return (
                              <Badge
                                key={tag}
                                variant={isRequired ? "default" : "outline"}
                                className={isRequired ? "bg-green-100 text-green-800" : ""}
                              >
                                {tag}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      {submission.required_hashtags.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Required Hashtags:</h4>
                          <div className="flex flex-wrap gap-2">
                            {submission.required_hashtags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setSelectedSubmission(submission)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review Submission
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Submission</DialogTitle>
                          <DialogDescription>
                            Review this social media post and decide whether to approve or reject it.
                          </DialogDescription>
                        </DialogHeader>

                        {selectedSubmission && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>User:</strong> {selectedSubmission.user_name}
                              </div>
                              <div>
                                <strong>Platform:</strong> {selectedSubmission.platform}
                              </div>
                              <div>
                                <strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}
                              </div>
                              <div>
                                <strong>Potential XP:</strong> 25 XP
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                              <Textarea
                                id="admin_notes"
                                placeholder="Add notes about your decision..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleReview(selectedSubmission.id, "approve")}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Award XP
                              </Button>
                              <Button
                                onClick={() => handleReview(selectedSubmission.id, "reject")}
                                disabled={isProcessing}
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviewed">
          <div className="space-y-4">
            {reviewedSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(submission.platform)}
                      <div>
                        <h3 className="font-medium">{submission.user_name}</h3>
                        <p className="text-sm text-gray-600">{submission.user_email}</p>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </Badge>
                      {submission.xp_awarded > 0 && <Badge variant="secondary">+{submission.xp_awarded} XP</Badge>}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>
                        Reviewed:{" "}
                        {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleDateString() : "N/A"}
                      </p>
                      <p>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {submission.admin_notes && (
                    <div className="mt-3 bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <strong className="text-sm">Admin Notes:</strong>
                      </div>
                      <p className="text-sm">{submission.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
