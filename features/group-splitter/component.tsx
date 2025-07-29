"use client"

import { useState } from "react"
import { ArrowLeft, Users, DollarSign, Plus, Trash2, Calculator, Gift, Star, Heart, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { TIERS, type UserTier } from "@/lib/global-logic"

interface GroupSplitterProps {
  userTier: UserTier
}

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

export function GroupSplitter({ userTier }: GroupSplitterProps) {
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

  return (
    <UserTierGate userTier={userTier} requiredTier={TIERS.PREMIUM_SPY} featureName="Group Splitter">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <a href="/dashboard">
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Group Splitter™</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Split gift costs with friends & family</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <div className="space-y-6">
                {/* Gift Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <span>Gift Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="giftName">Gift Name</Label>
                        <Input
                          id="giftName"
                          placeholder="e.g., Premium Spa Day"
                          value={giftName}
                          onChange={(e) => setGiftName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="recipientName">Recipient Name</Label>
                        <Input
                          id="recipientName"
                          placeholder="e.g., Sarah Johnson"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="occasion">Occasion</Label>
                        <Input
                          id="occasion"
                          placeholder="e.g., Birthday, Anniversary"
                          value={occasion}
                          onChange={(e) => setOccasion(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalBudget">Total Budget</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="totalBudget"
                            type="number"
                            placeholder="0.00"
                            className="pl-10"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span>Participants</span>
                      </div>
                      <Button onClick={addParticipant} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Person
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center space-x-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Name"
                            value={participant.name}
                            onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                          />
                          <Input
                            placeholder="Email (optional)"
                            type="email"
                            value={participant.email}
                            onChange={(e) => updateParticipant(participant.id, "email", e.target.value)}
                          />
                        </div>
                        {participants.length > 1 && (
                          <Button
                            onClick={() => removeParticipant(participant.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Calculate Button */}
                <Button
                  onClick={calculateContributions}
                  disabled={!giftName || !recipientName || !totalBudget || isCalculating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <Calculator className="w-5 h-5 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Split
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-green-600" />
                      <span>Split Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{giftName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              For {recipientName} • {occasion}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">${totalBudget}</div>
                            <div className="text-sm text-gray-500">Total Budget</div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Contribution Breakdown</h4>
                        {participants
                          .filter((p) => p.name.trim())
                          .map((participant, index) => (
                            <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{participant.name}</div>
                                  {participant.email && (
                                    <div className="text-sm text-gray-500">{participant.email}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-purple-600">
                                  ${participant.contribution.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">contribution</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Gifts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>Suggested Gifts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mockSuggestedGifts.map((gift) => (
                        <div key={gift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                            <Gift className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {gift.category}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{gift.rating}</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{gift.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{gift.description}</p>
                            <div className="text-lg font-bold text-green-600">${gift.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-600 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Setup
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Heart className="w-4 h-4 mr-2" />
                    Send Invites
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserTierGate>
  )
} 