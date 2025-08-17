"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Gift, Heart, Users, Star, ArrowRight, CheckCircle, Zap, Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { analytics } from "@/lib/analytics"

interface QuestionnaireData {
  recipientName: string
  relationship: string
  occasion: string
  budget: string
  interests: string[]
  personality: string
  giftHistory: string
  specialRequests: string
}

const interests = [
  "Technology",
  "Books",
  "Sports",
  "Music",
  "Art",
  "Cooking",
  "Travel",
  "Fashion",
  "Gaming",
  "Fitness",
  "Photography",
  "Gardening",
]

const personalities = ["Adventurous", "Creative", "Practical", "Sentimental", "Minimalist", "Luxury-loving"]

export default function LandingPage() {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<QuestionnaireData>({
    recipientName: "",
    relationship: "",
    occasion: "",
    budget: "",
    interests: [],
    personality: "",
    giftHistory: "",
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [giftSuggestions, setGiftSuggestions] = useState<string[]>([])
  const router = useRouter()

  // Track page view on mount
  useEffect(() => {
    const trackPageView = async () => {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search)
      const utmParams = {
        utm_source: urlParams.get("utm_source"),
        utm_medium: urlParams.get("utm_medium"),
        utm_campaign: urlParams.get("utm_campaign"),
        utm_term: urlParams.get("utm_term"),
        utm_content: urlParams.get("utm_content"),
        referrer: document.referrer,
      }

      await analytics.track("landing_page_view", {
        page: "home",
        ...utmParams,
      })
    }

    trackPageView()
  }, [])

  const handleQuestionnaireOpen = async () => {
    setIsQuestionnaireOpen(true)
    await analytics.trackConversion("questionnaire_started", {
      source: "hero_cta",
    })
  }

  const handleStepComplete = async (step: number, data: Partial<QuestionnaireData>) => {
    await analytics.trackQuestionnaireStep(step, data)
  }

  const nextStep = async () => {
    await handleStepComplete(currentStep, formData)
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Track questionnaire completion
      await analytics.trackQuestionnaireComplete(formData)

      // Generate AI suggestions (mock for now)
      const suggestions = [
        `A personalized ${formData.interests[0]?.toLowerCase() || "hobby"} starter kit`,
        `Custom ${formData.relationship} experience gift`,
        `Thoughtful ${formData.occasion.toLowerCase()} keepsake`,
      ]

      setGiftSuggestions(suggestions)
      setCurrentStep(6) // Results step
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetRecommendations = async () => {
    await analytics.trackCTAClick("questionnaire_complete", {
      questionnaire_data: formData,
      suggestions: giftSuggestions,
    })

    // Redirect to auth with questionnaire data
    const params = new URLSearchParams({
      redirect: "/dashboard",
      completed_questionnaire: "true",
      recipient_name: formData.recipientName,
      relationship: formData.relationship,
      occasion: formData.occasion,
    })

    router.push(`/auth?${params.toString()}`)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientName">Who are you shopping for?</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                placeholder="e.g., My sister Sarah"
              />
            </div>
            <div>
              <Label htmlFor="relationship">What's your relationship?</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse/Partner</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="occasion">What's the occasion?</Label>
              <Select
                value={formData.occasion}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, occasion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="just-because">Just Because</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="budget">What's your budget range?</Label>
              <Select
                value={formData.budget}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-25">Under $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-250">$100 - $250</SelectItem>
                  <SelectItem value="250-500">$250 - $500</SelectItem>
                  <SelectItem value="over-500">Over $500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>What are their interests? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <Label htmlFor={interest} className="text-sm">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="personality">How would you describe their personality?</Label>
              <Select
                value={formData.personality}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, personality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select personality type" />
                </SelectTrigger>
                <SelectContent>
                  {personalities.map((personality) => (
                    <SelectItem key={personality} value={personality.toLowerCase()}>
                      {personality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="giftHistory">What gifts have you given them before?</Label>
              <Textarea
                id="giftHistory"
                value={formData.giftHistory}
                onChange={(e) => setFormData((prev) => ({ ...prev, giftHistory: e.target.value }))}
                placeholder="Tell us about previous gifts to avoid duplicates..."
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialRequests">Any special requests or considerations?</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Allergies, preferences, things to avoid..."
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Perfect! Here are your AI-powered gift suggestions:</h3>
            </div>
            <div className="space-y-2">
              {giftSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-4">
              <Button onClick={handleGetRecommendations} className="w-full">
                Get My Full Gift Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Gift Intelligence
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6">
            Find the Perfect Gift Every Time
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our AI analyzes personality, preferences, and relationships to suggest gifts that create genuine emotional
            connections and lasting memories.
          </p>

          <Dialog open={isQuestionnaireOpen} onOpenChange={setIsQuestionnaireOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleQuestionnaireOpen}
              >
                <Gift className="mr-2 h-5 w-5" />
                Get My Gift Recommendations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gift Questionnaire</DialogTitle>
                <DialogDescription>Step {currentStep} of 5 - Help us understand your gift recipient</DialogDescription>
              </DialogHeader>

              <div className="py-4">{renderStep()}</div>

              {currentStep < 6 && (
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && (!formData.recipientName || !formData.relationship)) ||
                        (currentStep === 2 && (!formData.occasion || !formData.budget)) ||
                        (currentStep === 3 && formData.interests.length === 0) ||
                        (currentStep === 4 && !formData.personality)
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Generating..." : "Get Suggestions"}
                    </Button>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why AgentGift.ai?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform combines emotional intelligence with gift expertise to ensure every gift creates a
            meaningful connection.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Personalized Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our AI analyzes personality traits, interests, and relationship dynamics to suggest gifts that truly
                resonate.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <CardTitle>Emotional Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Every suggestion is designed to strengthen relationships and create lasting emotional impact.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized gift recommendations in seconds, not hours of browsing and guessing.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-8">Trusted by Gift-Givers Worldwide</h3>
          <div className="flex justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="font-semibold">4.9/5</span>
              <span className="ml-1">Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-1" />
              <span className="font-semibold">50K+</span>
              <span className="ml-1">Happy Users</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-5 w-5 text-green-500 mr-1" />
              <span className="font-semibold">1M+</span>
              <span className="ml-1">Gifts Recommended</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
