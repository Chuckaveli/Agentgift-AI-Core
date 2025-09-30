"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Gift, Sparkles, ArrowRight, ArrowLeft } from "lucide-react"

interface QuestionnaireData {
  recipientName: string
  relationship: string
  loveLanguage: string
  interests: string[]
  birthday?: string
  hobbies?: string
}

interface GiftSuggestion {
  title: string
  description: string
  price: string
  confidence: number
  category: string
}

const loveLanguages = ["Words of Affirmation", "Acts of Service", "Receiving Gifts", "Quality Time", "Physical Touch"]

const interestOptions = [
  "Technology",
  "Books",
  "Music",
  "Art",
  "Sports",
  "Cooking",
  "Travel",
  "Fashion",
  "Gaming",
  "Fitness",
  "Photography",
  "Gardening",
  "Movies",
  "Crafts",
  "Outdoor Activities",
  "Beauty",
  "Home Decor",
  "Pets",
]

export default function QuestionnairePage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<QuestionnaireData>({
    recipientName: "",
    relationship: "",
    loveLanguage: "",
    interests: [],
    birthday: "",
    hobbies: "",
  })
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])

  const progress = (step / 3) * 100

  const handleInterestToggle = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/gift-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setSuggestions(result.suggestions || [])
        setStep(4)
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.recipientName && data.relationship && data.loveLanguage
      case 2:
        return data.interests.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">30-Second Gift Finder</h1>
          </div>
          <p className="text-gray-600">Answer a few quick questions to get personalized gift suggestions</p>
        </div>

        {step < 4 && (
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">Step {step} of 3</p>
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <Heart className="h-5 w-5 text-red-500" />}
              {step === 2 && <Sparkles className="h-5 w-5 text-yellow-500" />}
              {step === 3 && <Gift className="h-5 w-5 text-green-500" />}
              {step === 4 && <Gift className="h-5 w-5 text-purple-500" />}

              {step === 1 && "Tell us about them"}
              {step === 2 && "What are they into?"}
              {step === 3 && "Final touches"}
              {step === 4 && "Your personalized suggestions"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Basic information about your gift recipient"}
              {step === 2 && "Select their interests and hobbies"}
              {step === 3 && "Optional details to refine suggestions"}
              {step === 4 && "AI-generated gift ideas just for them"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Recipient's Name</Label>
                  <Input
                    id="name"
                    value={data.recipientName}
                    onChange={(e) => setData((prev) => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="e.g., Sarah, Mom, Best Friend"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Your Relationship</Label>
                  <Input
                    id="relationship"
                    value={data.relationship}
                    onChange={(e) => setData((prev) => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Sister, Colleague, Partner"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Their Love Language</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {loveLanguages.map((language) => (
                      <Button
                        key={language}
                        variant={data.loveLanguage === language ? "default" : "outline"}
                        onClick={() => setData((prev) => ({ ...prev, loveLanguage: language }))}
                        className="justify-start"
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <Label>Select their interests (choose as many as apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      variant={data.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer p-2 text-center justify-center"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Selected: {data.interests.length} interests</p>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday (optional)</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={data.birthday}
                    onChange={(e) => setData((prev) => ({ ...prev, birthday: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbies">Additional hobbies or notes (optional)</Label>
                  <Textarea
                    id="hobbies"
                    value={data.hobbies}
                    onChange={(e) => setData((prev) => ({ ...prev, hobbies: e.target.value }))}
                    placeholder="Any specific hobbies, preferences, or things they've mentioned wanting..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                          <Badge variant="secondary">{suggestion.price}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{suggestion.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{suggestion.category}</Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Confidence:</span>
                            <Progress value={suggestion.confidence} className="w-20 h-2" />
                            <span className="text-sm font-medium">{suggestion.confidence}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Generating personalized suggestions...</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && step < 4 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {step < 3 && (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="ml-auto flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {step === 3 && (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="ml-auto flex items-center gap-2"
                >
                  {loading ? "Generating..." : "Get Suggestions"}
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}

              {step === 4 && (
                <Button
                  onClick={() => {
                    setStep(1)
                    setData({
                      recipientName: "",
                      relationship: "",
                      loveLanguage: "",
                      interests: [],
                      birthday: "",
                      hobbies: "",
                    })
                    setSuggestions([])
                  }}
                  className="ml-auto"
                >
                  Start Over
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
