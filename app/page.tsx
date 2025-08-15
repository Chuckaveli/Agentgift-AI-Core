"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Gift, Heart, Sparkles, Users, Clock, Star, ArrowRight, Zap, Brain, Target } from "lucide-react"
import Link from "next/link"

interface GiftSuggestion {
  id: string
  title: string
  description: string
  price: string
  matchScore: number
  reasoning: string
  category: string
}

interface FormData {
  recipientName: string
  relationship: string
  birthday: string
  loveLanguage: string
  interests: string[]
  hobbies: string
}

const loveLanguages = [
  { value: "words-of-affirmation", label: "Words of Affirmation" },
  { value: "quality-time", label: "Quality Time" },
  { value: "receiving-gifts", label: "Receiving Gifts" },
  { value: "acts-of-service", label: "Acts of Service" },
  { value: "physical-touch", label: "Physical Touch" },
]

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
]

const relationships = [
  "Friend",
  "Parent",
  "Partner",
  "Sibling",
  "Coworker",
  "Child",
  "Grandparent",
  "Boss",
  "Teacher",
  "Other",
]

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    recipientName: "",
    relationship: "",
    birthday: "",
    loveLanguage: "",
    interests: [],
    hobbies: "",
  })

  const [giftSuggestions] = useState<GiftSuggestion[]>([
    {
      id: "1",
      title: "Personalized Recipe Journal",
      description: "Custom leather-bound cookbook with their name embossed",
      price: "$45-65",
      matchScore: 94,
      reasoning: "Perfect for someone who loves cooking and values quality time in the kitchen",
      category: "Personalized",
    },
    {
      id: "2",
      title: "Premium Coffee Subscription",
      description: "3-month subscription to artisanal coffee from around the world",
      price: "$89",
      matchScore: 87,
      reasoning: "Great for daily enjoyment and shows ongoing thoughtfulness",
      category: "Subscription",
    },
    {
      id: "3",
      title: "Cooking Class Experience",
      description: "Local hands-on cooking class for two people",
      price: "$120-180",
      matchScore: 91,
      reasoning: "Combines their love of cooking with quality time together",
      category: "Experience",
    },
  ])

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

  const handleGenerateGifts = async () => {
    setIsGenerating(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsGenerating(false)
    setShowResults(true)
  }

  const resetModal = () => {
    setCurrentStep(1)
    setShowResults(false)
    setIsGenerating(false)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section with Entry Point */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Gift Intelligence
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Perfect Gifts,
            <br />
            Every Time
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop guessing. Start giving gifts that create genuine emotional connections. Our AI analyzes psychology,
            interests, and relationships to suggest gifts that truly matter.
          </p>

          {/* User Entry Point */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-2xl mx-auto border border-purple-100 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-600 mr-2" />
              <span className="text-lg font-semibold text-gray-800">Test it in 30 seconds. No sign-up required.</span>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Gift className="w-5 h-5 mr-2" />🎯 Gift Now
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    {showResults ? "🎁 Your Personalized Gift Ideas" : "🧠 Smart Gift Questionnaire"}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {showResults
                      ? "AI-generated suggestions based on your answers"
                      : `Step ${currentStep} of 3 - This helps us understand the perfect gift`}
                  </DialogDescription>
                </DialogHeader>

                {!showResults && !isGenerating && (
                  <div className="space-y-6">
                    <Progress value={(currentStep / 3) * 100} className="w-full" />

                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Users className="w-5 h-5 mr-2 text-purple-600" />
                          Recipient Basics
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Recipient's Name</Label>
                            <Input
                              id="name"
                              value={formData.recipientName}
                              onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                              placeholder="e.g., Sarah, Mom, Alex"
                            />
                          </div>

                          <div>
                            <Label htmlFor="relationship">Your Relationship</Label>
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

                          <div>
                            <Label htmlFor="birthday">Birthday (Optional)</Label>
                            <Input
                              id="birthday"
                              type="date"
                              value={formData.birthday}
                              onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value }))}
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => setCurrentStep(2)}
                          disabled={!formData.recipientName || !formData.relationship}
                          className="w-full"
                        >
                          Next: Emotional Insight <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Heart className="w-5 h-5 mr-2 text-pink-600" />
                          Emotional Insight
                        </h3>

                        <div>
                          <Label>What's their Love Language?</Label>
                          <p className="text-sm text-gray-600 mb-3">How do they best receive and express love?</p>
                          <Select
                            value={formData.loveLanguage}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, loveLanguage: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select love language" />
                            </SelectTrigger>
                            <SelectContent>
                              {loveLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setCurrentStep(1)}>
                            Back
                          </Button>
                          <Button
                            onClick={() => setCurrentStep(3)}
                            disabled={!formData.loveLanguage}
                            className="flex-1"
                          >
                            Next: Interests <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-600" />
                          Interests & Hobbies
                        </h3>

                        <div>
                          <Label>Select up to 3 interests</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {interestOptions.map((interest) => (
                              <div key={interest} className="flex items-center space-x-2">
                                <Checkbox
                                  id={interest}
                                  checked={formData.interests.includes(interest)}
                                  onCheckedChange={() => handleInterestToggle(interest)}
                                  disabled={!formData.interests.includes(interest) && formData.interests.length >= 3}
                                />
                                <Label htmlFor={interest} className="text-sm">
                                  {interest}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="hobbies">Specific Hobbies or Activities (Optional)</Label>
                          <Textarea
                            id="hobbies"
                            value={formData.hobbies}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))}
                            placeholder="e.g., rock climbing, vintage vinyl collecting, baking sourdough..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setCurrentStep(2)}>
                            Back
                          </Button>
                          <Button
                            onClick={handleGenerateGifts}
                            disabled={formData.interests.length === 0}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Zap className="w-4 h-4 mr-2" />⚡ Generate My 3 Gift Ideas
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">🧠 AI is analyzing...</h3>
                    <p className="text-gray-600">Processing psychology, interests, and relationship dynamics</p>
                  </div>
                )}

                {showResults && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {giftSuggestions.map((gift, index) => (
                        <Card key={gift.id} className="border-l-4 border-l-purple-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{gift.title}</CardTitle>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {gift.matchScore}% match
                              </Badge>
                            </div>
                            <CardDescription>{gift.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-purple-600">{gift.price}</span>
                                <Badge variant="outline">{gift.category}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 italic">💡 {gift.reasoning}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                        Want More Personalized Ideas?
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Sign up to unlock unlimited gift suggestions, price tracking, and reminder notifications.
                      </p>
                      <div className="flex gap-2">
                        <Link href="/auth/signup" className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            Sign Up Free
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={handleModalClose}>
                          Maybe Later
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <p className="text-sm text-gray-500 mt-3">
              ⚡ Instant results • 🧠 Psychology-based • 🎯 Personalized for them
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-purple-600" />
              30-second setup
            </div>
            <div className="flex items-center">
              <Brain className="w-4 h-4 mr-1 text-purple-600" />
              AI-powered psychology
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1 text-purple-600" />
              Emotional connection focus
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why AgentGift Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine psychology, AI, and human insight to help you give gifts that strengthen relationships
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <CardHeader>
                <CardTitle>Psychology-Based</CardTitle>
                <CardDescription>
                  Uses love languages, personality types, and relationship dynamics to suggest meaningful gifts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardHeader>
                <CardTitle>AI-Powered Intelligence</CardTitle>
                <CardDescription>
                  Advanced algorithms analyze millions of gift combinations to find the perfect match
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardHeader>
                <CardTitle>Emotional Connection</CardTitle>
                <CardDescription>
                  Focus on gifts that create lasting memories and strengthen your relationships
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Give Better Gifts?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of people who've transformed their gift-giving with AI-powered insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                Start Free Account
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
              onClick={() => setIsModalOpen(true)}
            >
              Try Demo First
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
