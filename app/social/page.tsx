"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Instagram,
  Facebook,
  Linkedin,
  Video,
  ImageIcon,
  Type,
  CalendarIcon,
  Clock,
  TrendingUp,
  Sparkles,
  Plus,
  Settings,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Share,
  CheckCircle,
  AlertCircle,
  Gift,
  Zap,
  Target,
} from "lucide-react"

// Mock data for connected accounts
const connectedAccounts = [
  {
    platform: "Instagram",
    icon: Instagram,
    connected: true,
    username: "@agentgift_ai",
    followers: "12.5K",
    color: "from-pink-500 to-purple-500",
  },
  {
    platform: "TikTok",
    icon: Video,
    connected: true,
    username: "@agentgift",
    followers: "8.2K",
    color: "from-black to-gray-800",
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    connected: false,
    username: "",
    followers: "0",
    color: "from-blue-600 to-blue-700",
  },
  {
    platform: "Facebook",
    icon: Facebook,
    connected: true,
    username: "AgentGift.ai",
    followers: "5.1K",
    color: "from-blue-500 to-blue-600",
  },
]

// Mock scheduled posts
const scheduledPosts = [
  {
    id: 1,
    content: "🎁 Gift hack: The best presents aren't the most expensive ones...",
    platforms: ["Instagram", "TikTok"],
    scheduledFor: "2024-01-15T14:00:00",
    type: "text",
    aiGenerated: true,
    status: "scheduled",
  },
  {
    id: 2,
    content: "Valentine's Day is coming! Here's how AI can help you find the perfect gift 💕",
    platforms: ["Instagram", "Facebook"],
    scheduledFor: "2024-01-16T10:30:00",
    type: "image",
    aiGenerated: false,
    status: "scheduled",
  },
  {
    id: 3,
    content: "Last-minute gift ideas that don't look last-minute 🚀",
    platforms: ["TikTok"],
    scheduledFor: "2024-01-14T18:00:00",
    type: "video",
    aiGenerated: true,
    status: "published",
  },
]

// AI Personas
const aiPersonas = [
  {
    id: "avelyn",
    name: "Avelyn",
    specialty: "Romance & Relationships",
    tone: "Warm, empathetic, romantic",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "galen",
    name: "Galen",
    specialty: "Tech & Gadgets",
    tone: "Smart, analytical, trendy",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "zola",
    name: "Zola",
    specialty: "Luxury & Premium",
    tone: "Sophisticated, exclusive, refined",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function SocialPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [postContent, setPostContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [aiEnabled, setAiEnabled] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState("avelyn")
  const [postType, setPostType] = useState("text")
  const [isCreatingPost, setIsCreatingPost] = useState(false)

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const generateAIContent = () => {
    const persona = aiPersonas.find((p) => p.id === selectedPersona)
    const sampleContent = [
      "🎁 The secret to perfect gifting? It's not about the price tag, it's about showing you truly know someone. Here's how AI helps us understand what matters most...",
      "Gift-giving anxiety is real! 😅 But what if I told you there's a way to give gifts that feel perfectly personal every single time? Let me share the science behind meaningful presents...",
      "Plot twist: The best gifts aren't things at all. They're experiences, memories, and moments that say 'I see you.' Here's how to master the art of thoughtful giving...",
    ]

    setPostContent(sampleContent[Math.floor(Math.random() * sampleContent.length)])
  }

  const getEngagementEstimate = () => {
    const baseEngagement = selectedPlatforms.length * 150
    const aiBonus = aiEnabled ? 50 : 0
    const personaBonus = selectedPersona === "avelyn" ? 30 : selectedPersona === "zola" ? 20 : 25
    return baseEngagement + aiBonus + personaBonus
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Share className="w-6 h-6 text-purple-500" />
                Social Sync
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your social presence with AI-powered content</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account Connections & Analytics */}
          <div className="space-y-6">
            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Connected Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedAccounts.map((account) => {
                  const Icon = account.icon
                  return (
                    <div key={account.platform} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-r ${account.color} flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{account.platform}</p>
                          {account.connected ? (
                            <p className="text-sm text-gray-500">
                              {account.username} • {account.followers}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Not connected</p>
                          )}
                        </div>
                      </div>
                      {account.connected ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          Connect
                        </Button>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">2.4K</div>
                    <div className="text-sm text-gray-600">Engagement</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      Likes
                    </span>
                    <span>1.8K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      Comments
                    </span>
                    <span>342</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Share className="w-4 h-4 text-green-500" />
                      Shares
                    </span>
                    <span>156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Personas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Personas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiPersonas.map((persona) => (
                  <div
                    key={persona.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPersona === persona.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={persona.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{persona.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{persona.name}</p>
                        <p className="text-xs text-gray-500">{persona.specialty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Content Creator */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Create Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Post Type Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={postType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("text")}
                    className="flex-1"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    variant={postType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("image")}
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    variant={postType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("video")}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>

                {/* AI Toggle */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">AI Content Generation</span>
                  </div>
                  <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                </div>

                {/* Content Input */}
                <div className="space-y-2">
                  <Label htmlFor="content">Post Content</Label>
                  <Textarea
                    id="content"
                    placeholder="What's your gift wisdom for today?"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  {aiEnabled && (
                    <Button variant="outline" size="sm" onClick={generateAIContent} className="w-full bg-transparent">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Content
                    </Button>
                  )}
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>Post to Platforms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {connectedAccounts
                      .filter((account) => account.connected)
                      .map((account) => {
                        const Icon = account.icon
                        const isSelected = selectedPlatforms.includes(account.platform)
                        return (
                          <Button
                            key={account.platform}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePlatformToggle(account.platform)}
                            className="justify-start"
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {account.platform}
                          </Button>
                        )
                      })}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Clock className="w-4 h-4 mr-2" />
                      Post Now
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="time">Time</Label>
                              <Input id="time" type="time" defaultValue="14:00" />
                            </div>
                            <div>
                              <Label htmlFor="timezone">Timezone</Label>
                              <Select defaultValue="pst">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pst">PST</SelectItem>
                                  <SelectItem value="est">EST</SelectItem>
                                  <SelectItem value="utc">UTC</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button className="w-full">Schedule Post</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Save Draft
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={!postContent || selectedPlatforms.length === 0}
                  >
                    {isCreatingPost ? "Publishing..." : "Publish"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Engagement Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">{getEngagementEstimate()}</div>
                    <div className="text-xs text-gray-500">Est. Reach</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-pink-600">{Math.round(getEngagementEstimate() * 0.15)}</div>
                    <div className="text-xs text-gray-500">Est. Likes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{Math.round(getEngagementEstimate() * 0.05)}</div>
                    <div className="text-xs text-gray-500">Est. Comments</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Optimal posting time</span>
                    <Badge variant="secondary">2:00 PM</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Best performing hashtags</span>
                    <Badge variant="secondary">#giftideas</Badge>
                  </div>
                </div>

                {/* Tag Checklist */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content Checklist</Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Engaging hook</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Call to action</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span>Relevant hashtags</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar & Scheduled Posts */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Content Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
                />
              </CardContent>
            </Card>

            {/* Scheduled Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                      <Badge variant={post.status === "published" ? "default" : "secondary"} className="ml-2 shrink-0">
                        {post.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(post.scheduledFor).toLocaleDateString()}
                      <Clock className="w-3 h-3 ml-2" />
                      {new Date(post.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {post.platforms.map((platform) => {
                          const account = connectedAccounts.find((acc) => acc.platform === platform)
                          if (!account) return null
                          const Icon = account.icon
                          return (
                            <div
                              key={platform}
                              className={`w-6 h-6 rounded bg-gradient-to-r ${account.color} flex items-center justify-center`}
                            >
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                          )
                        })}
                      </div>

                      {post.aiGenerated && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Future Features Preview */}
            <Card className="border-dashed border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Zap className="w-5 h-5" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>AI Auto-posting</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Gift className="w-4 h-4" />
                  <span>XP Rewards for posts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Audience insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>Advanced analytics</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
