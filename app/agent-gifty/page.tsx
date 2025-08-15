"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Sparkles,
  Lock,
  Crown,
  QrCode,
  Pause,
  Video,
  Mic,
  Type,
  Send,
  Eye,
  Download,
  Share2,
  Gift,
  Heart,
  Star,
} from "lucide-react"
import Link from "next/link"

// Mock user data - in real app this would come from auth/context
const userData = {
  tier: "premium", // Change to "pro" to see full functionality
  name: "Alex Chen",
}

const tierHierarchy = {
  free: 0,
  premium: 1,
  pro: 2,
  agent00g: 3,
}

export default function AgentGiftyPage() {
  const [messageType, setMessageType] = useState<"text" | "voice" | "video">("text")
  const [textMessage, setTextMessage] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [giftDescription, setGiftDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)

  const hasProAccess = tierHierarchy[userData.tier as keyof typeof tierHierarchy] >= tierHierarchy.pro

  const handleGenerateQR = () => {
    setQrGenerated(true)
  }

  const handleToggleRecording = () => {
    setIsRecording(!isRecording)
  }

  if (!hasProAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agent Gifty™</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personalized Gift Drops</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white">Pro Feature</Badge>
            </div>
          </div>
        </header>

        {/* Locked Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Feature Preview */}
            <Card className="relative overflow-hidden mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <CardContent className="p-8 relative">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Agent Gifty™ Preview</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                      Create personalized gift drops with custom messages, QR codes, and branded delivery experiences.
                      Perfect for surprise gifts, special occasions, and memorable moments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locked Preview UI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Message Creation - Locked */}
              <Card className="relative">
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Lock className="w-8 h-8 mx-auto mb-3" />
                    <p className="font-semibold mb-1">Message Creator</p>
                    <p className="text-sm text-gray-300">Pro feature locked</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Type className="w-5 h-5" />
                    <span>Create Your Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 opacity-30">
                  <Tabs defaultValue="text">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="text">Text</TabsTrigger>
                      <TabsTrigger value="voice">Voice</TabsTrigger>
                      <TabsTrigger value="video">Video</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="space-y-4">
                      <div>
                        <Label>Your Message</Label>
                        <Textarea placeholder="Write your personalized message..." className="min-h-32" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* QR Generator - Locked */}
              <Card className="relative">
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Lock className="w-8 h-8 mx-auto mb-3" />
                    <p className="font-semibold mb-1">QR Generator</p>
                    <p className="text-sm text-gray-300">Pro feature locked</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>Generate QR Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 opacity-30">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                    <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">QR code will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Section - Locked */}
            <Card className="relative mb-8">
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Lock className="w-8 h-8 mx-auto mb-3" />
                  <p className="font-semibold mb-1">Delivery Preview</p>
                  <p className="text-sm text-gray-300">Pro feature locked</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Preview Delivery Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="opacity-30">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🎁 You've received a gift from Alex!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Tap to reveal your personalized message</p>
                  <div className="flex justify-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <Star className="w-5 h-5 text-yellow-500" />
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-800/50">
              <CardContent className="p-8 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Unlock personalized gift drops with Agent Gifty™
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Upgrade to Pro to create custom messages, generate QR codes, and deliver unforgettable gift
                      experiences.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      asChild
                    >
                      <Link href="/pricing">
                        <Crown className="w-5 h-5 mr-2" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-transparent"
                      asChild
                    >
                      <Link href="/pricing">Compare Plans</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Pro user experience
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agent Gifty™</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Personalized Gift Drops</p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">Pro Active</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Message Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Type className="w-5 h-5" />
                  <span>Create Your Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Name</Label>
                    <Input
                      id="recipient"
                      placeholder="Enter recipient name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gift">Gift Description</Label>
                    <Input
                      id="gift"
                      placeholder="What's the gift?"
                      value={giftDescription}
                      onChange={(e) => setGiftDescription(e.target.value)}
                    />
                  </div>
                </div>

                <Tabs value={messageType} onValueChange={(value) => setMessageType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="flex items-center space-x-2">
                      <Type className="w-4 h-4" />
                      <span>Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <span>Voice</span>
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Write your personalized message..."
                        className="min-h-32"
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="voice" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Button
                          size="lg"
                          onClick={handleToggleRecording}
                          className={`w-16 h-16 rounded-full ${
                            isRecording
                              ? "bg-red-500 hover:bg-red-600 animate-pulse"
                              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          }`}
                        >
                          {isRecording ? <Pause className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
                      </p>
                      {isRecording && (
                        <div className="flex justify-center">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-purple-500 rounded-full animate-pulse"
                                style={{
                                  height: `${Math.random() * 20 + 10}px`,
                                  animationDelay: `${i * 0.1}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Camera preview will appear here</p>
                          <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500">
                            <Video className="w-4 h-4 mr-2" />
                            Start Recording
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* QR Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Generate QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                  {qrGenerated ? (
                    <div className="space-y-4">
                      <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center border-4 border-gray-200">
                        <div className="grid grid-cols-8 gap-1">
                          {[...Array(64)].map((_, i) => (
                            <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <QrCode className="w-24 h-24 mx-auto text-gray-400" />
                      <p className="text-gray-500">QR code will appear here</p>
                      <Button
                        onClick={handleGenerateQR}
                        disabled={!recipientName || (!textMessage && messageType === "text")}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Preview Delivery Experience</span>
                </div>
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Full Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Gift Delivery Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          🎁 You've received a gift from {userData.name}!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {giftDescription || "A special surprise"}
                        </p>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          Reveal Message
                        </Button>
                      </div>
                      {textMessage && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                          <p className="text-gray-900 dark:text-white">{textMessage}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  🎁 You've received a gift from {userData.name}!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {recipientName ? `Hey ${recipientName}! ` : ""}
                  {giftDescription || "A special surprise awaits you"}
                </p>
                <div className="flex justify-center space-x-2 mb-4">
                  <Heart className="w-5 h-5 text-red-500" />
                  <Star className="w-5 h-5 text-yellow-500" />
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Tap to reveal your message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Send Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!recipientName || (!textMessage && messageType === "text") || !qrGenerated}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Gift Drop
                </Button>
                <Button size="lg" variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

