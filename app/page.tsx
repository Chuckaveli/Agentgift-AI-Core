"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Gift, Heart, Sparkles, Clock, ArrowRight, CheckCircle, Users, Zap, Target, Loader2 } from "lucide-react"

interface GiftSuggestion {
  name: string
  match: number
  reasoning: string
  price: string
  category: string
  confidence: number
  imageUrl?: string
  purchaseUrl?: string
}

interface FormData {
  recipientName: string
  relationship: string
  birthday: string
  loveLanguage: string
  interests: string[]
  hobbies: string
}

interface SignupData {
  email: string
  password: string
}

export default function LandingPage() {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([])

  const [formData, setFormData] = useState<FormData>({
    recipientName: "",
    relationship: "",
    birthday: "",
    loveLanguage: "",
    interests: [],
    hobbies: "",
  })

  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
  })

  const loveLanguages = [
    { id: "words", label: "Words of Affirmation", description: "Verbal appreciation and encouragement" },
    { id: "quality", label: "Quality Time", description: "Focused attention and shared experiences" },
    { id: "gifts", label: "Receiving Gifts", description: "Thoughtful presents and surprises" },
    { id: "acts", label: "Acts of Service", description: "Helpful actions and gestures" },
    { id: "touch", label: "Physical Touch", description: "Hugs, hand-holding, and affection" },
  ]

  const interestOptions = [
    "Art & Creativity",
    "Books & Reading",
    "Coffee & Tea",
    "Cooking & Baking",
    "Fitness & Wellness",
    "Gaming",
    "Gardening",
    "Music",
    "Outdoor Activities",
    "Photography",
    "Technology",
    "Travel",
  ]

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked && formData.interests.length < 3) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }))
    } else if (!checked) {
      setFormData((prev) => ({
        ...prev,
        interests: prev.interests.filter((i) => i !== interest),
      }))
    }
  }

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit questionnaire
      setIsProcessing(true)

      try {
        const response = await fetch("/api/gift-questionnaire", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate gift suggestions")
        }

        setSessionId(data.sessionId)
        setGiftSuggestions(data.suggestions)
        setIsProcessing(false)
        setShowResults(true)

        toast({
          title: "Perfect matches found! 🎁",
          description: `We found ${data.suggestions.length} personalized gift suggestions for ${formData.recipientName}.`,
        })
      } catch (error) {
        console.error("Questionnaire error:", error)
        setIsProcessing(false)
        toast({
          title: "Oops! Something went wrong",
          description: "Please try again. Our AI is usually much faster!",
          variant: "destructive",
        })
      }
    }
  }

  const handleGetResults = () => {
    setShowSignUp(true)
  }

  const handleSignUp = async () => {
    if (!signupData.email || !signupData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsSigningUp(true)

    try {
      const response = await fetch("/api/gift-questionnaire/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...signupData,
          sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      toast({
        title: "Welcome to AgentGift! 🎉",
        description: data.message,
      })

      // Close modal and redirect to dashboard
      setIsModalOpen(false)
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningUp(false)
    }
  }

  const resetModal = () => {
    setCurrentStep(1)
    setShowResults(false)
    setShowSignUp(false)
    setIsProcessing(false)
    setSessionId("")
    setGiftSuggestions([])
    setFormData({
      recipientName: "",
      relationship: "",
      birthday: "",
      loveLanguage: "",
      interests: [],
      hobbies: "",
    })
    setSignupData({
      email: "",
      password: "",
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.recipientName && formData.relationship
      case 2:
        return formData.loveLanguage
      case 3:
        return formData.interests.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full">
              <Gift className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Find the Perfect Gift in 30 Seconds
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our AI analyzes personality, interests, and love languages to suggest gifts that create genuine emotional
            connections.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Dialog
              open={isModalOpen}
              onOpenChange={(open) => {
                setIsModalOpen(open)
                if (!open) resetModal()
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Gift Now - 30 Seconds
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    {showSignUp
                      ? "Get Your Personalized Results"
                      : showResults
                        ? "Your Perfect Gift Matches"
                        : isProcessing
                          ? "AI is Finding Perfect Gifts..."
                          : `Step ${currentStep} of 3`}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {showSignUp
                      ? "Create your free account to access these personalized recommendations"
                      : showResults
                        ? `Based on your inputs, here are your top matches for ${formData.recipientName}`
                        : isProcessing
                          ? "Analyzing personality, interests, and emotional preferences..."
                          : "Quick questions to find the perfect gift"}
                  </DialogDescription>
                </DialogHeader>

                {!showResults && !isProcessing && !showSignUp && (
                  <div className="mb-4">
                    <Progress value={(currentStep / 3) * 100} className="w-full" />
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium mb-2">Analyzing your inputs...</p>
                    <p className="text-gray-600">Finding gifts that match {formData.recipientName}'s personality</p>
                  </div>
                )}

                {showSignUp && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">🎯 Your Results Are Ready!</h3>
                      <p className="text-gray-600">
                        We found {giftSuggestions.length} perfect matches with{" "}
                        {Math.max(...giftSuggestions.map((g) => g.match))}% compatibility score for{" "}
                        {formData.recipientName}.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Create Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Choose a secure password"
                          value={signupData.password}
                          onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSignUp}
                      disabled={isSigningUp}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isSigningUp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Get My Gift Recommendations"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                )}

                {showResults && !showSignUp && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {giftSuggestions.map((gift, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{gift.name}</CardTitle>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {gift.match}% Match
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">{gift.category}</Badge>
                              <Badge variant="outline">{gift.price}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm">{gift.reasoning}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Want the full analysis?</span>
                      </div>
                      <p className="text-yellow-700 text-sm mb-3">
                        Get detailed reasoning, alternative options, and purchase links for each recommendation.
                      </p>
                      <Button
                        onClick={handleGetResults}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Get Full Results (Free)
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 1: Recipient Basics */}
                {currentStep === 1 && !isProcessing && !showResults && !showSignUp && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Recipient's Name</Label>
                      <Input
                        id="name"
                        value={formData.recipientName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="What should we call them?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="relationship">Your Relationship</Label>
                      <Input
                        id="relationship"
                        value={formData.relationship}
                        onChange={(e) => setFormData((prev) => ({ ...prev, relationship: e.target.value }))}
                        placeholder="e.g., Partner, Best Friend, Sister, Colleague"
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthday">Their Birthday (Optional)</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value }))}
                      />
                    </div>

                    <Button onClick={handleNext} disabled={!canProceed()} className="w-full">
                      Next: Love Language <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Love Language */}
                {currentStep === 2 && !isProcessing && !showResults && !showSignUp && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">What's their primary love language?</Label>
                      <p className="text-sm text-gray-600 mb-4">How do they best receive and express love?</p>
                    </div>

                    <RadioGroup
                      value={formData.loveLanguage}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, loveLanguage: value }))}
                    >
                      {loveLanguages.map((lang) => (
                        <div
                          key={lang.id}
                          className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <RadioGroupItem value={lang.id} id={lang.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={lang.id} className="font-medium cursor-pointer">
                              {lang.label}
                            </Label>
                            <p className="text-sm text-gray-600">{lang.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button onClick={handleNext} disabled={!canProceed()} className="w-full">
                      Next: Interests <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Step 3: Interests */}
                {currentStep === 3 && !isProcessing && !showResults && !showSignUp && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Select up to 3 interests</Label>
                      <p className="text-sm text-gray-600 mb-4">What do they enjoy most?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {interestOptions.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={formData.interests.includes(interest)}
                            onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                            disabled={!formData.interests.includes(interest) && formData.interests.length >= 3}
                          />
                          <Label htmlFor={interest} className="text-sm cursor-pointer">
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="hobbies">Any specific hobbies? (Optional)</Label>
                      <Textarea
                        id="hobbies"
                        value={formData.hobbies}
                        onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))}
                        placeholder="e.g., vintage vinyl collecting, rock climbing, watercolor painting..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find Perfect Gifts
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>No sign-up required</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mt-2" />
              </div>
              <h3 className="font-semibold mb-2">94% Match Rate</h3>
              <p className="text-gray-600 text-sm">AI-powered personality analysis</p>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mt-2" />
              </div>
              <h3 className="font-semibold mb-2">50K+ Happy Gifters</h3>
              <p className="text-gray-600 text-sm">Trusted by gift-givers worldwide</p>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mt-2" />
              </div>
              <h3 className="font-semibold mb-2">30 Second Results</h3>
              <p className="text-gray-600 text-sm">Instant personalized recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI combines psychology research with gift expertise to find presents that create real emotional
              connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600 mx-auto" />
                </div>
                <CardTitle>Analyze Love Language</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We identify how they best receive love using Gary Chapman's proven 5 Love Languages framework.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600 mx-auto" />
                </div>
                <CardTitle>Match Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI cross-references their hobbies and interests with thousands of gift possibilities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600 mx-auto" />
                </div>
                <CardTitle>Perfect Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get 3 personalized recommendations with detailed reasoning and confidence scores.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop Guessing. Start Giving Gifts They'll Love.</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of thoughtful gift-givers who use AI to create meaningful moments.
          </p>

          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open)
              if (!open) resetModal()
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                <Gift className="mr-2 h-5 w-5" />
                Try It Free - 30 Seconds
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
