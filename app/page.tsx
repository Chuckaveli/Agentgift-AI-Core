"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Gift,
  Sparkles,
  Heart,
  Star,
  Users,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle,
  Brain,
  Target,
  Lightbulb,
  Loader2,
} from "lucide-react"
import { analytics } from "@/lib/analytics"

interface QuestionnaireData {
  recipientName: string
  relationship: string
  occasion: string
  interests: string
  budget: string
  personalityType: string
  giftHistory: string
  specialRequests: string
}

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<QuestionnaireData>({
    recipientName: "",
    relationship: "",
    occasion: "",
    interests: "",
    budget: "",
    personalityType: "",
    giftHistory: "",
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  useEffect(() => {
    // Track landing page view
    const trackPageView = async () => {
      await analytics.track("landing_page_view", {
        page: "home",
        referrer: document.referrer,
        utm_source: new URLSearchParams(window.location.search).get("utm_source"),
        utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
        utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
      })
    }

    trackPageView()
  }, [])

  const handleInputChange = (field: keyof QuestionnaireData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    // Track step completion
    await analytics.track("questionnaire_step_completed", {
      step: currentStep,
      total_steps: totalSteps,
      form_data: formData,
    })

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleModalOpen = async () => {
    setIsModalOpen(true)
    await analytics.track("questionnaire_started", {
      trigger: "cta_button",
      modal_opened: true,
    })
  }

  const generateAISuggestions = (data: QuestionnaireData): string[] => {
    const suggestions = []

    if (data.interests.toLowerCase().includes("tech")) {
      suggestions.push("🎧 Premium wireless headphones with noise cancellation")
      suggestions.push("📱 Smart home device or gadget")
    }

    if (data.interests.toLowerCase().includes("book")) {
      suggestions.push("📚 Personalized leather-bound journal")
      suggestions.push("💡 Reading light with adjustable brightness")
    }

    if (data.relationship === "romantic_partner") {
      suggestions.push("💝 Custom photo album with your memories")
      suggestions.push("🌹 Subscription to monthly flower delivery")
    }

    if (data.occasion === "birthday") {
      suggestions.push("🎂 Experience gift - cooking class or wine tasting")
      suggestions.push("🎁 Personalized star map from a special date")
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push("🎨 Personalized artwork or custom portrait")
      suggestions.push("🧘 Wellness package - spa day or meditation kit")
      suggestions.push("🍷 Curated gift box based on their interests")
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Generate AI suggestions
      const suggestions = generateAISuggestions(formData)
      setAiSuggestions(suggestions)

      // Track questionnaire completion
      await analytics.track("questionnaire_completed", {
        form_data: formData,
        ai_suggestions: suggestions,
        completion_time: Date.now(),
      })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setCurrentStep(totalSteps + 1) // Show results step
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetRecommendations = async () => {
    // Track CTA click
    await analytics.track("cta_clicked", {
      button: "get_my_gift_recommendations",
      questionnaire_completed: true,
      recipient_name: formData.recipientName,
      relationship: formData.relationship,
      occasion: formData.occasion,
    })

    // Build redirect URL with questionnaire data
    const params = new URLSearchParams({
      completed_questionnaire: "true",
      recipient_name: formData.recipientName,
      relationship: formData.relationship,
      occasion: formData.occasion,
      redirect: "/dashboard",
    })

    // Redirect to auth page
    window.location.href = `/auth?${params.toString()}`
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
                onChange={(e) => handleInputChange("recipientName", e.target.value)}
                placeholder="e.g., Sarah, Mom, Best Friend"
              />
            </div>
            <div>
              <Label htmlFor="relationship">What's your relationship?</Label>
              <Select value={formData.relationship} onValueChange={(value) => handleInputChange("relationship", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romantic_partner">Romantic Partner</SelectItem>
                  <SelectItem value="family_member">Family Member</SelectItem>
                  <SelectItem value="close_friend">Close Friend</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="acquaintance">Acquaintance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="occasion">What's the occasion?</Label>
              <Select value={formData.occasion} onValueChange={(value) => handleInputChange("occasion", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="just_because">Just Because</SelectItem>
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
              <Label htmlFor="interests">What are their main interests or hobbies?</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange("interests", e.target.value)}
                placeholder="e.g., reading, cooking, technology, sports, art, music..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="personalityType">How would you describe their personality?</Label>
              <Select
                value={formData.personalityType}
                onValueChange={(value) => handleInputChange("personalityType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select personality type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventurous">Adventurous & Outgoing</SelectItem>
                  <SelectItem value="creative">Creative & Artistic</SelectItem>
                  <SelectItem value="practical">Practical & Organized</SelectItem>
                  <SelectItem value="intellectual">Intellectual & Curious</SelectItem>
                  <SelectItem value="nurturing">Nurturing & Caring</SelectItem>
                  <SelectItem value="fun_loving">Fun-loving & Spontaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget">What's your budget range?</Label>
              <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_25">Under $25</SelectItem>
                  <SelectItem value="25_50">$25 - $50</SelectItem>
                  <SelectItem value="50_100">$50 - $100</SelectItem>
                  <SelectItem value="100_250">$100 - $250</SelectItem>
                  <SelectItem value="250_500">$250 - $500</SelectItem>
                  <SelectItem value="over_500">Over $500</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="giftHistory">What gifts have you given them before?</Label>
              <Textarea
                id="giftHistory"
                value={formData.giftHistory}
                onChange={(e) => handleInputChange("giftHistory", e.target.value)}
                placeholder="e.g., books, jewelry, experiences, gadgets... (helps us avoid duplicates)"
                rows={3}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialRequests">Any special requirements or preferences?</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                placeholder="e.g., eco-friendly, handmade, local brands, specific colors, allergies to avoid..."
                rows={4}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect! Here are your AI-powered suggestions:</h3>
              <p className="text-gray-600">
                Based on your answers, here are some personalized gift ideas for {formData.recipientName}:
              </p>
            </div>

            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                >
                  <p className="text-gray-800 font-medium">{suggestion}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium">Want more personalized recommendations?</p>
                  <p className="text-blue-700 text-sm">
                    Create your free account to unlock our full AI gift concierge with cultural intelligence, price
                    tracking, and delivery coordination!
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGetRecommendations}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
              size="lg"
            >
              Get My Gift Recommendations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift.ai
                </h1>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Global Beta
                </Badge>
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find the Perfect Gift
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Every Time
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered gift recommendations that understand emotions, relationships, and cultural context. Never give
              a disappointing gift again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                    onClick={handleModalOpen}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Get AI Gift Recommendations
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">AI Gift Questionnaire</DialogTitle>
                    <DialogDescription className="text-center">
                      Answer a few questions and get personalized gift recommendations powered by AI
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {currentStep <= totalSteps && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-600">
                            Step {currentStep} of {totalSteps}
                          </span>
                          <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} className="mb-6" />
                      </div>
                    )}

                    {renderStep()}

                    {currentStep <= totalSteps && (
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                          Previous
                        </Button>

                        {currentStep < totalSteps ? (
                          <Button
                            onClick={handleNext}
                            disabled={
                              (currentStep === 1 &&
                                (!formData.recipientName || !formData.relationship || !formData.occasion)) ||
                              (currentStep === 2 && (!formData.interests || !formData.personalityType)) ||
                              (currentStep === 3 && !formData.budget)
                            }
                          >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Generating..." : "Get My Recommendations"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-transparent">
                <Target className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                50+ Countries
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                25+ Languages
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                1000+ Holidays
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                10K+ Happy Gifters
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why AgentGift.ai is Different</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI doesn't just suggest random gifts. It understands relationships, emotions, and cultural context to
              find gifts that truly matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Emotional Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our AI understands the emotional context of your relationship and the significance of the occasion to
                  suggest truly meaningful gifts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>Cultural Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Respects cultural traditions, holidays, and customs from around the world to ensure your gifts are
                  always appropriate and appreciated.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Smart Personalization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learns from your preferences, past gifts, and feedback to provide increasingly personalized
                  recommendations over time.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Give Better Gifts?</h3>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of thoughtful gift-givers who never miss the mark.
          </p>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg"
                onClick={handleModalOpen}
              >
                <Gift className="mr-2 h-5 w-5" />
                Start Finding Perfect Gifts
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
