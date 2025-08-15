"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { ArrowLeft, Users, DollarSign, Plus, Trash2, Calculator, Gift, Star, Heart, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { FEATURES } from "@/lib/feature-access"

interface Participant {
  id: string
  name: string
  email: string
  contribution: number
}

interface SuggestedGift {
  id: string
  name: string
  price: number
  category: string
  rating: number
  image: string
  description: string
}

const mockSuggestedGifts: SuggestedGift[] = [
  {
    id: "1",
    name: "Premium Spa Day Experience",
    price: 299,
    category: "Experience",
    rating: 4.9,
    image: "/placeholder.svg?height=120&width=120",
    description: "Luxury spa package with massage and treatments",
  },
  {
    id: "2",
    name: "Professional Coffee Machine",
    price: 285,
    category: "Kitchen",
    rating: 4.8,
    image: "/placeholder.svg?height=120&width=120",
    description: "High-end espresso machine for coffee lovers",
  },
  {
    id: "3",
    name: "Weekend Getaway Package",
    price: 320,
    category: "Travel",
    rating: 4.7,
    image: "/placeholder.svg?height=120&width=120",
    description: "Two-night stay at boutique hotel with breakfast",
  },
]

export default function GroupGiftingPage() {
  const router = useRouter()
  const { hasAccess, requiredTier } = useFeatureAccess(FEATURES.TEAM_COLLABORATION)

  const [step, setStep] = useState(1)
  const [giftName, setGiftName] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [occasion, setOccasion] = useState("")
  const [totalBudget, setTotalBudget] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([{ id: "1", name: "", email: "", contribution: 0 }])
  const [isCalculating, setIsCalculating] = useState(false)

  const addParticipant = () => {
    setParticipants([...participants, { id: Date.now().toString(), name: "", email: "", contribution: 0 }])
  }

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id))
    }
  }

  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const calculateContributions = () => {
    setIsCalculating(true)
    setTimeout(() => {
      const budget = Number.parseFloat(totalBudget) || 0
      const validParticipants = participants.filter((p) => p.name.trim())
      const contributionPerPerson = budget / validParticipants.length

      setParticipants(participants.map((p) => (p.name.trim() ? { ...p, contribution: contributionPerPerson } : p)))
      setIsCalculating(false)
      setStep(2)
    }, 1500)
  }

  const totalContributions = participants.reduce((sum, p) => sum + p.contribution, 0)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="text-lg font-semibold text-white">Smart Group Splitter</h1>
            <div className="w-20" />
          </div>
        </div>

        {/* Locked Preview */}
        <div className="p-4 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Smart Group Splitter</h2>
            <p className="text-purple-200 max-w-md mx-auto">
              Organize group gifts effortlessly. Set budgets, invite friends, and split costs automatically.
            </p>
          </div>

          {/* Blurred Preview */}
          <div className="relative">
            <div className="filter blur-sm opacity-60 space-y-4">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Gift Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Gift Name</Label>
                    <Input
                      placeholder="Birthday surprise for Sarah"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-purple-200">Recipient</Label>
                      <Input
                        placeholder="Sarah Johnson"
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="text-purple-200">Total Budget</Label>
                      <Input
                        placeholder="$300"
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Name"
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled
                      />
                      <Input
                        placeholder="email@example.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white max-w-sm mx-4">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Make group gifting effortless</h3>
                  <p className="text-purple-100">Unlock this tool with Pro+ and organize group gifts like a pro</p>
                  <Button
                    className="w-full bg-white text-purple-600 hover:bg-purple-50"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade to Pro+
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <h1 className="text-lg font-semibold text-white">Smart Group Splitter</h1>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
            Pro
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? "bg-purple-500 text-white" : "bg-white/20 text-purple-300"
            }`}
          >
            1
          </div>
          <div className={`w-12 h-1 rounded ${step >= 2 ? "bg-purple-500" : "bg-white/20"}`} />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? "bg-purple-500 text-white" : "bg-white/20 text-purple-300"
            }`}
          >
            2
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Gift Details */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Gift Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-purple-200">Gift Name</Label>
                  <Input
                    value={giftName}
                    onChange={(e) => setGiftName(e.target.value)}
                    placeholder="Birthday surprise for Sarah"
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Recipient</Label>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Sarah Johnson"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200">Occasion</Label>
                    <Input
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      placeholder="Birthday"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-purple-200">Total Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                    <Input
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      placeholder="300"
                      type="number"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants ({participants.filter((p) => p.name.trim()).length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addParticipant}
                    className="text-purple-300 hover:text-white hover:bg-white/20"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 text-sm font-medium w-6">{index + 1}.</span>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          value={participant.name}
                          onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                          placeholder="Name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={participant.email}
                            onChange={(e) => updateParticipant(participant.id, "email", e.target.value)}
                            placeholder="email@example.com"
                            type="email"
                            className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                          />
                          {participants.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <Button
              onClick={calculateContributions}
              disabled={
                !giftName || !totalBudget || participants.filter((p) => p.name.trim()).length < 2 || isCalculating
              }
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating contributions...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculate & Continue
                </div>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Group Gift Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-300">Gift:</span>
                    <p className="text-white font-medium">{giftName}</p>
                  </div>
                  <div>
                    <span className="text-purple-300">Recipient:</span>
                    <p className="text-white font-medium">{recipientName}</p>
                  </div>
                  <div>
                    <span className="text-purple-300">Total Budget:</span>
                    <p className="text-white font-medium">${totalBudget}</p>
                  </div>
                  <div>
                    <span className="text-purple-300">Participants:</span>
                    <p className="text-white font-medium">{participants.filter((p) => p.name.trim()).length}</p>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Contribution Breakdown:</h4>
                  {participants
                    .filter((p) => p.name.trim())
                    .map((participant) => (
                      <div key={participant.id} className="flex justify-between items-center">
                        <span className="text-purple-200">{participant.name}</span>
                        <span className="text-white font-medium">${participant.contribution.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Gifts */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Suggested Gifts
                </CardTitle>
                <p className="text-purple-200 text-sm">Perfect matches for your budget and occasion</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSuggestedGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={gift.image || "/placeholder.svg"}
                      alt={gift.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-white font-medium text-sm">{gift.name}</h4>
                        <span className="text-green-400 font-bold text-sm">${gift.price}</span>
                      </div>
                      <p className="text-purple-200 text-xs">{gift.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                          {gift.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-xs">{gift.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Edit Details
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Heart className="h-4 w-4 mr-2" />
                Send Invites
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

