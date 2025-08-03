"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Heart, Users, Zap, Star, ArrowRight, CheckCircle, Globe, Brain, Target } from "lucide-react"
import HeroGiftAnimation from "@/components/animations/hero-gift-animation"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, SparkleIcon as Sparkles2, GiftIcon as Gift2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  const [showGiftModal, setShowGiftModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [giftIdeas, setGiftIdeas] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    birthday: undefined as Date | undefined,
    loveLanguage: "",
    interests: [] as string[],
    notes: "",
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const relationships = [
    "Partner",
    "Friend",
    "Coworker",
    "Parent",
    "Child",
    "Sibling",
    "Grandparent",
    "Boss",
    "Teacher",
    "Neighbor",
    "Other",
  ]

  const loveLanguages = [
    { value: "words", label: "Words of Affirmation", icon: "💬" },
    { value: "acts", label: "Acts of Service", icon: "🤝" },
    { value: "gifts", label: "Receiving Gifts", icon: "🎁" },
    { value: "time", label: "Quality Time", icon: "⏰" },
    { value: "touch", label: "Physical Touch", icon: "🤗" },
  ]

  const interestOptions = [
    { value: "gaming", label: "Gaming", icon: "🎮" },
    { value: "fitness", label: "Fitness", icon: "💪" },
    { value: "cooking", label: "Cooking", icon: "👨‍🍳" },
    { value: "tech", label: "Tech", icon: "💻" },
    { value: "books", label: "Books", icon: "📚" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "wellness", label: "Wellness", icon: "🧘‍♀️" },
    { value: "art", label: "Art", icon: "🎨" },
    { value: "pets", label: "Pets", icon: "🐕" },
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "fashion", label: "Fashion", icon: "👗" },
    { value: "outdoors", label: "Outdoors", icon: "🏔️" },
  ]

  const toggleInterest = (interest: string) => {
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockIdeas = [
      {
        title: "Personalized Memory Book",
        description: "A custom photo album with your favorite memories together",
        price: "$45-65",
        tier: "thoughtful",
      },
      {
        title: "Artisan Coffee Subscription",
        description: "Monthly delivery of premium coffee beans from around the world",
        price: "$25-40/month",
        tier: "experiential",
      },
      {
        title: "Smart Fitness Tracker",
        description: "Advanced health monitoring with personalized insights",
        price: "$150-250",
        tier: "practical",
      },
    ]

    setGiftIdeas(mockIdeas)
    setIsGenerating(false)

    // Store lead data
    try {
      await fetch("/api/gift-entry-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Failed to store lead:", error)
    }
  }

  const resetModal = () => {
    setCurrentStep(1)
    setGiftIdeas([])
    setIsGenerating(false)
    setFormData({
      name: "",
      relationship: "",
      birthday: undefined,
      loveLanguage: "",
      interests: [],
      notes: "",
    })
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description:
        "Get personalized gift suggestions based on recipient preferences, personality, and cultural background.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Cultural Intelligence",
      description: "Navigate gift-giving customs across different cultures with our comprehensive cultural database.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Our advanced algorithms match gifts to personalities, occasions, and relationship dynamics.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Understand the emotional impact of your gifts with our sentiment analysis technology.",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: Users,
      title: "Group Gifting",
      description: "Coordinate group gifts seamlessly with shared wishlists and contribution tracking.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Sparkles,
      title: "Gift DNA Analysis",
      description: "Decode gift preferences with our proprietary Gift DNA technology for perfect matches.",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      content:
        "AgentGift.ai helped me find the perfect gifts for my international team. The cultural insights are invaluable!",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Father of 3",
      content:
        "Finally, a gift platform that understands my family's unique dynamics. The AI recommendations are spot-on.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Event Planner",
      content:
        "The group gifting feature has revolutionized how I coordinate client appreciation gifts. Absolutely brilliant!",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div
              className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI-Powered Gift Intelligence
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Transform Your
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                    Gifting Experience
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg">
                  Discover perfect gifts with AI-powered recommendations, cultural intelligence, and personalized
                  insights that make every gift meaningful.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Link href="/dashboard">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">50K+</div>
                  <div className="text-sm text-muted-foreground">Perfect Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Animation */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              <HeroGiftAnimation className="w-full h-96 lg:h-[500px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-4 h-4 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Perfect Gifting
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools takes the guesswork out of gift-giving, ensuring every present
              creates lasting memories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gift Now Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            >
              <Sparkles2 className="w-4 h-4 mr-1" />
              Try It Now
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              ✨ Test it in 30 seconds.
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                No sign-up required.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Give us just a few details about someone you care about. We'll suggest the perfect gift using emotional
              intelligence and a little AI magic.
            </p>

            <Button
              size="lg"
              onClick={() => setShowGiftModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Gift2 className="w-6 h-6 mr-2" />🎯 Gift Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Heart className="w-4 h-4 mr-1" />
              Customer Love
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Trusted by Gift-Givers
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`transition-all duration-300 hover:shadow-lg ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-white">Ready to Give the Perfect Gift?</h2>
            <p className="text-xl text-purple-100">
              Join thousands of users who have transformed their gifting experience with AgentGift.ai
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">
                  <Gift className="w-5 h-5 mr-2" />
                  Start Gifting Now
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Generation Modal */}
      <Dialog
        open={showGiftModal}
        onOpenChange={(open) => {
          setShowGiftModal(open)
          if (!open) resetModal()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Gift Generator
            </DialogTitle>
          </DialogHeader>

          {giftIdeas.length > 0 ? (
            // Gift Ideas Display
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">🎁 Perfect Gifts for {formData.name}</h3>
                <p className="text-muted-foreground">Based on their personality and interests</p>
              </div>

              <div className="grid gap-4">
                {giftIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{idea.title}</h4>
                      <Badge variant="secondary">{idea.price}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{idea.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {idea.tier}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <h4 className="font-semibold mb-2">🚀 Want more personalized suggestions?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a free account to save these ideas and unlock advanced features
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Link href="/dashboard">Create Free Account</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login">Already have one? Log In</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : isGenerating ? (
            // Loading State
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Analyzing...</h3>
              <p className="text-muted-foreground">Using AI magic to find the perfect gifts</p>
            </div>
          ) : (
            // Form Steps
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      currentStep >= step
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gray-200 text-gray-500",
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Recipient Basics
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">🧑 Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="What's their name?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="relationship">🧬 Relationship</Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How do you know them?" />
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

                    <div>
                      <Label>🎂 Birthday</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.birthday && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.birthday ? format(formData.birthday, "PPP") : "Pick their birthday"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.birthday}
                            onSelect={(date) => setFormData((prev) => ({ ...prev, birthday: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.name || !formData.relationship}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    What makes them feel most appreciated?
                  </h3>

                  <div className="grid gap-3">
                    {loveLanguages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setFormData((prev) => ({ ...prev, loveLanguage: lang.value }))}
                        className={cn(
                          "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                          formData.loveLanguage === lang.value
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                            : "border-gray-200 hover:border-purple-300",
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{lang.icon}</span>
                          <span className="font-medium">{lang.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.loveLanguage}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-orange-600" />
                    Interests & Activities
                  </h3>

                  <div>
                    <Label className="text-sm text-muted-foreground mb-3 block">
                      Select up to 3 interests (tap to toggle)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {interestOptions.map((interest) => (
                        <button
                          key={interest.value}
                          onClick={() => toggleInterest(interest.value)}
                          disabled={!formData.interests.includes(interest.value) && formData.interests.length >= 3}
                          className={cn(
                            "p-3 border rounded-lg text-sm transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                            formData.interests.includes(interest.value)
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300"
                              : "border-gray-200 hover:border-purple-300",
                          )}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg">{interest.icon}</span>
                            <span className="font-medium">{interest.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Tell us any hobbies or favorite activities?</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any specific hobbies, collections, or things they love?"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={generateGiftIdeas}
                      disabled={formData.interests.length === 0}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Generate My 3 Gift Ideas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
