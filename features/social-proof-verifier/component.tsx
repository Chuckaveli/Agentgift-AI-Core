"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { ToastBadgeNotifier, triggerXPGain, triggerBadgeUnlock } from "@/components/global/toast-badge-notifier"
import {
  Instagram,
  Twitter,
  Music,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Hash,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { TIERS } from "@/lib/global-logic"

interface SocialProof {
  id: string
  platform: string
  post_url: string
  caption_text: string
  hashtags: string[]
  status: "pending" | "approved" | "rejected"
  xp_awarded: number
  submitted_at: string
  admin_notes?: string
}

interface SocialCampaign {
  id: string
  name: string
  description: string
  required_hashtags: string[]
  optional_hashtags: string[]
  xp_reward: number
  badge_reward: string
  min_posts_for_badge: number
  is_active: boolean
}

export default function SocialProofVerifier() {
  const [userTier, setUserTier] = useState<string>("free_agent")
  const [submissions, setSubmissions] = useState<SocialProof[]>([])
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")

  // Form state
  const [platform, setPlatform] = useState<string>("")
  const [postUrl, setPostUrl] = useState<string>("")
  const [manualCaption, setManualCaption] = useState<string>("")
  const [manualHashtags, setManualHashtags] = useState<string>("")

  useEffect(() => {
    fetchUserData()
    fetchSubmissions()
    fetchCampaigns()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()
      setUserTier(data.tier || "free_agent")
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/social-proofs")
      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error("Error fetching submissions:", error)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/social-campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform || !postUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/social-proofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          post_url: postUrl,
          campaign_id: selectedCampaign,
          manual_caption: manualCaption,
          manual_hashtags: manualHashtags.split(" ").filter((tag) => tag.startsWith("#")),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Post submitted for verification!")
        if (data.auto_approved) {
          triggerXPGain(data.xp_awarded, "Social media post approved")
          if (data.badge_unlocked) {
            triggerBadgeUnlock(data.badge_name)
          }
        }

        // Reset form
        setPlatform("")
        setPostUrl("")
        setManualCaption("")
        setManualHashtags("")
        setSelectedCampaign("")

        // Refresh submissions
        fetchSubmissions()
      } else {
        toast.error(data.error || "Failed to submit post")
      }
    } catch (error) {
      console.error("Error submitting post:", error)
      toast.error("Failed to submit post")
    } finally {
      setIsSubmitting(false)
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

  const approvedPosts = submissions.filter((s) => s.status === "approved").length
  const totalXPEarned = submissions.reduce((sum, s) => sum + s.xp_awarded, 0)

  return (
    <UserTierGate
      userTier={userTier as any}
      requiredTier={TIERS.PREMIUM_SPY}
      featureName="Social Participation Tracker"
    >
      <div className="container mx-auto p-4 max-w-4xl">
        <ToastBadgeNotifier />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Social Participation Tracker</h1>
          <p className="text-gray-600">
            Share your AgentGift moments on social media and earn XP! Post with campaign hashtags to get verified and
            unlock exclusive badges.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{approvedPosts}</p>
                  <p className="text-sm text-gray-600">Approved Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{totalXPEarned}</p>
                  <p className="text-sm text-gray-600">XP Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{submissions.filter((s) => s.status === "pending").length}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submit">Submit Post</TabsTrigger>
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="history">My Submissions</TabsTrigger>
          </TabsList>

          {/* Submit Post Tab */}
          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Social Media Post</CardTitle>
                <CardDescription>
                  Share your AgentGift moments and get rewarded! Make sure to include the required campaign hashtags.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform *</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">
                            <div className="flex items-center gap-2">
                              <Instagram className="w-4 h-4" />
                              Instagram
                            </div>
                          </SelectItem>
                          <SelectItem value="tiktok">
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4" />
                              TikTok
                            </div>
                          </SelectItem>
                          <SelectItem value="twitter">
                            <div className="flex items-center gap-2">
                              <Twitter className="w-4 h-4" />
                              Twitter/X
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaign">Campaign (Optional)</Label>
                      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns
                            .filter((c) => c.is_active)
                            .map((campaign) => (
                              <SelectItem key={campaign.id} value={campaign.id}>
                                {campaign.name} (+{campaign.xp_reward} XP)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post_url">Post URL *</Label>
                    <Input
                      id="post_url"
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">Make sure your post is public so we can verify it</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual_caption">Caption (Optional)</Label>
                    <Textarea
                      id="manual_caption"
                      placeholder="If auto-detection fails, paste your caption here..."
                      value={manualCaption}
                      onChange={(e) => setManualCaption(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual_hashtags">Hashtags (Optional)</Label>
                    <Input
                      id="manual_hashtags"
                      placeholder="#AgentGifted #GiftRevealChallenge"
                      value={manualHashtags}
                      onChange={(e) => setManualHashtags(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">Space-separated hashtags (include # symbol)</p>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-4">
              {campaigns
                .filter((c) => c.is_active)
                .map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">+{campaign.xp_reward} XP</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Required Hashtags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {campaign.required_hashtags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {campaign.optional_hashtags.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Optional Hashtags</h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.optional_hashtags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Badge after {campaign.min_posts_for_badge} posts
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Submission History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                    <p className="text-gray-600 mb-4">Start sharing your AgentGift moments to earn XP and badges!</p>
                    <Button onClick={() => document.querySelector('[value="submit"]')?.click()}>
                      Submit Your First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                submissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(submission.platform)}
                          <span className="font-medium capitalize">{submission.platform}</span>
                          <Badge className={getStatusColor(submission.status)}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1 capitalize">{submission.status}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                          {submission.xp_awarded > 0 && (
                            <p className="text-sm font-medium text-green-600">+{submission.xp_awarded} XP</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          <a
                            href={submission.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm truncate"
                          >
                            {submission.post_url}
                          </a>
                        </div>

                        {submission.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {submission.hashtags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {submission.admin_notes && (
                          <div className="bg-gray-50 p-2 rounded text-sm">
                            <strong>Admin Notes:</strong> {submission.admin_notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Follow Us CTA */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Follow Us for More Campaigns!</h3>
              <p className="text-gray-600 mb-4">
                Stay updated with the latest gift campaigns and earn more XP by following our official accounts.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <a href="https://instagram.com/agentgift.ai" target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://tiktok.com/@agentgift.ai" target="_blank" rel="noopener noreferrer">
                    <Music className="w-4 h-4 mr-2" />
                    TikTok
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://twitter.com/agentgiftai" target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserTierGate>
  )
}
