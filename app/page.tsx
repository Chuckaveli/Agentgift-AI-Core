"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Gift,
  Sparkles,
  Globe,
  Brain,
  Users,
  ArrowRight,
  Heart,
  Crown,
  Target,
  Zap,
  Clock,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

interface GiftIdea {
  title: string
  description: string
  price: string
  reason: string
  matchScore: number
}

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([])
  const [formData, setFormData] = useState({
    recipientName: "",
    relationship: "",
    birthday: "",
    loveLanguage: "",
    interests: [] as string[],
    hobbies: "",
  })

  const features = [
    {
      icon: Gift,
      title: "AI Gift Concierge",
      description: "Get personalized gift recommendations powered by advanced AI",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      href: "/gift-dna",
    },
    {
      icon: Globe,
      title: "Cultural Intelligence",
      description: "Respect cultural traditions and customs in your gifting",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      href: "/cultural-respect",
    },
    {
      icon: Brain,
      title: "Smart Search",
      description: "Find the perfect gift with intelligent search capabilities",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      href: "/smart-search",
    },
    {
      icon: Users,
      title: "Group Gifting",
      description: "Coordinate group gifts and split costs seamlessly",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
      href: "/group-gifting",
    },
  ]

  const stats = [
    { label: "Happy Users", value: "10K+", icon: Heart },
    { label: "Gifts Recommended", value: "50K+", icon: Gift },
    { label: "Cultures Supported", value: "100+", icon: Globe },
    { label: "AI Accuracy", value: "95%", icon: Brain },
  ]

  const relationships = [
    "Friend",
    "Family Member",
    "Partner",
    "Colleague",
    "Boss",
    "Teacher",
    "Neighbor",
    "Acquaintance",
  ]

  const loveLanguages = ["Words of Affirmation", "Quality Time", "Receiving Gifts", "Acts of Service", "Physical Touch"]

  const interestOptions = [
    "Gaming",
    "Fitness",
    "Cooking",
    "Tech",
    "Books",
    "Music",
    "Wellness",
    "Art",
    "Pets",
    "Travel",
    "Fashion",
    "Sports",
    "Photography",
    "Gardening",
    "Movies",
    "Coffee",
    "Wine",
    "Crafts",
  ]

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 3
          ? [...prev.interests, interest]
          : prev.interests,
    }))
  }

  const generateGiftIdeas = async () => {
    setIsGenerating(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockIdeas: GiftIdea[] = [
      {
        title: "Personalized Recipe Journal",
        description:
          "A beautiful leather-bound journal with their name embossed, perfect for collecting favorite recipes",
        price: "$34.99",
        reason: `Perfect for someone who loves cooking! Since their love language is ${formData.loveLanguage.toLowerCase()}, this thoughtful gift shows you pay attention to their interests.`,
        matchScore: 94,
      },
      {
        title: "Premium Coffee Subscription",
        description: "Monthly delivery of artisan coffee beans from around the world with tasting notes",
        price: "$29.99/month",
        reason: `Great for building quality time moments and shows ongoing thoughtfulness - ideal for their ${formData.loveLanguage.toLowerCase()} preference.`,
        matchScore: 89,
      },
      {
        title: "Smart Cooking Thermometer",
        description: "Bluetooth-enabled thermometer that ensures perfect cooking results every time",
        price: "$79.99",
        reason: `Combines their love of cooking and tech! This practical gift aligns perfectly with acts of service by making their hobby easier.`,
        matchScore: 87,
      },
    ]

    setGiftIdeas(mockIdeas)
    setIsGenerating(false)
    toast.success("🎁 Your personalized gift ideas are ready!")
  }

  const resetModal = () => {
    setCurrentStep(1)
    setGiftIdeas([])
    setFormData({
      recipientName: "",
      relationship: "",
      birthday: "",
      loveLanguage: "",
      interests: [],
      hobbies: "",
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setTimeout(resetModal, 300) // Reset after modal closes
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Gift Intelligence
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-foreground">Gifting Experience</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover the perfect gift with AI-powered cultural intelligence, personalized recommendations, and
              gamified discovery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/gift-dna">
                  Try Gift DNA
                  <Gift className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Entry Point Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Target className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need a Gift Right Now?</h2>
            <p className="text-xl text-blue-100 mb-2">✨ Test it in 30 seconds. No sign-up required.</p>
            <p className="text-lg text-blue-200 mb-8">Get 3 personalized gift ideas based on psychology and AI</p>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Target className="mr-2 h-5 w-5" />🎯 Gift Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={handleModalClose}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    {giftIdeas.length > 0 ? "🎁 Your Personalized Gift Ideas" : "🧠 Smart Gift Questionnaire"}
                  </DialogTitle>
                </DialogHeader>

                {giftIdeas.length > 0 ? (
                  // Results View
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-4">
                        Generated for {formData.recipientName || "your recipient"}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {giftIdeas.map((idea, index) => (
                        <Card key={index} className="border-2 hover:border-purple-200 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">{idea.description}</p>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    {idea.price}
                                  </Badge>
                                  <Badge variant="secondary">{idea.matchScore}% match</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Why this works:</strong> {idea.reason}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="text-center space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">🚀 Want More Personalized Ideas?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Sign up to get unlimited gift suggestions, save favorites, and set gift reminders!
                        </p>
                        <Button className="w-full" asChild>
                          <Link href="/dashboard" onClick={handleModalClose}>
                            Get Full Access Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      <Button variant="outline" onClick={resetModal} className="w-full bg-transparent">
                        Try Another Recipient
                      </Button>
                    </div>
                  </div>
                ) : isGenerating ? (
                  // Loading View
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
                    <h3 className="text-xl font-semibold mb-2">🧠 AI is thinking...</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing personality, interests, and relationship dynamics
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Processing love language preferences
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Matching interests with gift categories
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                        Generating personalized recommendations
                      </div>
                    </div>
                  </div>
                ) : (
                  // Form Steps
                  <div className="space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex justify-center mb-6">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3].map((step) => (
                          <div key={step} className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep >= step ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {step}
                            </div>
                            {step < 3 && (
                              <div className={`w-8 h-1 mx-2 ${currentStep > step ? "bg-purple-600" : "bg-gray-200"}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center mb-4">🎯 Step 1: Recipient Basics</h3>

                        <div className="space-y-2">
                          <Label htmlFor="recipientName">Recipient's Name (optional)</Label>
                          <Input
                            id="recipientName"
                            placeholder="e.g., Sarah, Mom, My Boss"
                            value={formData.recipientName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="relationship">Relationship *</Label>
                          <Select
                            value={formData.relationship}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {relationships.map((rel) => (
                                <SelectItem key={rel} value={rel.toLowerCase()}>
                                  {rel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthday">Birthday (for reminders)</Label>
                          <Input
                            id="birthday"
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value }))}
                          />
                        </div>

                        <Button className="w-full" onClick={() => setCurrentStep(2)} disabled={!formData.relationship}>
                          Next: Emotional Insight
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center mb-4">💖 Step 2: Emotional Insight</h3>

                        <div className="space-y-2">
                          <Label>What's their Love Language? *</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            How do they best receive and express love?
                          </p>
                          <Select
                            value={formData.loveLanguage}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, loveLanguage: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select love language" />
                            </SelectTrigger>
                            <SelectContent>
                              {loveLanguages.map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                  {lang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                            Back
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => setCurrentStep(3)}
                            disabled={!formData.loveLanguage}
                          >
                            Next: Interests
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center mb-4">🎨 Step 3: Interests</h3>

                        <div className="space-y-3">
                          <Label>Select up to 3 interests *</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {interestOptions.map((interest) => (
                              <div key={interest} className="flex items-center space-x-2">
                                <Checkbox
                                  id={interest}
                                  checked={formData.interests.includes(interest)}
                                  onCheckedChange={() => handleInterestToggle(interest)}
                                  disabled={!formData.interests.includes(interest) && formData.interests.length >= 3}
                                />
                                <Label htmlFor={interest} className="text-sm cursor-pointer">
                                  {interest}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">Selected: {formData.interests.length}/3</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hobbies">Hobbies or Favorite Activities (optional)</Label>
                          <Input
                            id="hobbies"
                            placeholder="e.g., yoga, reading sci-fi, collecting vintage records"
                            value={formData.hobbies}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                            Back
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            onClick={generateGiftIdeas}
                            disabled={formData.interests.length === 0}
                          >
                            <Zap className="mr-2 h-4 w-4" />
                            Generate My 3 Gift Ideas
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="mt-6 flex items-center justify-center gap-4 text-blue-100">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">30 seconds</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">No sign-up</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span className="text-sm">AI-powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of gifting with our comprehensive suite of AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  hoveredFeature === index ? "scale-105" : ""
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={feature.href}>
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Crown className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Revolutionize Your Gifting?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of users who have transformed their gifting experience with AgentGift.ai
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/dashboard">
                Start Your Journey
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
