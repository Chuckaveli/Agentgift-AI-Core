"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PersonaPicker } from "@/components/concierge/PersonaPicker"
import { Orb } from "@/components/concierge/Orb"
import { SuggestionChips } from "@/components/concierge/SuggestionChips"
import { ConciergeChat } from "@/components/concierge/ConciergeChat"
import type { PersonaKey, DatabaseUserProfile } from "@/lib/types"

export default function ConciergePage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>("avelyn")
  const [userProfile, setUserProfile] = useState<DatabaseUserProfile | null>(null)

  // Mock user profile - replace with real Supabase data
  useEffect(() => {
    setUserProfile({
      id: "mock-user",
      tier: "Pro",
      xp_level: 150,
      love_language: "Quality Time",
      life_path_number: 7,
    })
  }, [])

  // Determine persona unlock status based on XP
  const getPersonaUnlocks = (xpLevel: number) => ({
    avelyn: true, // Always unlocked
    galen: xpLevel >= 50,
    zola: xpLevel >= 100,
    mei: xpLevel >= 200,
    arya: xpLevel >= 300,
  })

  const personaUnlocks = userProfile
    ? getPersonaUnlocks(userProfile.xp_level)
    : {
        avelyn: true,
        galen: false,
        zola: false,
        mei: false,
        arya: false,
      }

  // Get emotional signals status
  const getOrbStatus = (signal: string) => {
    if (!userProfile) return "locked"

    switch (signal) {
      case "Love Language":
        return userProfile.love_language ? "active" : "dim"
      case "Numerology":
        return userProfile.life_path_number ? "active" : "dim"
      case "Emotion Tag":
        return userProfile.tier !== "Free" ? "active" : "locked"
      case "Relationship":
        return userProfile.xp_level >= 100 ? "active" : "locked"
      case "Tier / XP":
        return "active"
      default:
        return "dim"
    }
  }

  const emotionalSignals = [
    {
      label: "Love Language",
      lottie: "/lottie/love_language.json",
      tooltip: userProfile?.love_language || "Complete profile to unlock",
    },
    {
      label: "Numerology",
      lottie: "/lottie/numerology.json",
      tooltip: userProfile?.life_path_number ? `Life Path ${userProfile.life_path_number}` : "Complete numerology quiz",
    },
    {
      label: "Emotion Tag",
      lottie: "/lottie/emotion_tag.json",
      tooltip: userProfile?.tier !== "Free" ? "Emotional preferences active" : "Upgrade to unlock",
    },
    {
      label: "Relationship",
      lottie: "/lottie/relationship.json",
      tooltip: userProfile && userProfile.xp_level >= 100 ? "Relationship context active" : "Reach 100 XP to unlock",
    },
    {
      label: "Tier / XP",
      lottie: "/lottie/tier.json",
      tooltip: userProfile ? `${userProfile.tier} - ${userProfile.xp_level} XP` : "Loading...",
    },
  ]

  const context = {
    userProfile,
    emotionalSignals: emotionalSignals.map((signal) => ({
      ...signal,
      status: getOrbStatus(signal.label),
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Gift Concierge
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your AI-powered gift advisor that understands your emotional signals and personal preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Emotional Signals */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Emotional Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {emotionalSignals.map((signal) => (
                    <Orb
                      key={signal.label}
                      label={signal.label}
                      status={getOrbStatus(signal.label)}
                      lottie={signal.lottie}
                      tooltip={signal.tooltip}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Choose Your AI Persona</h3>
                    <PersonaPicker value={selectedPersona} onChange={setSelectedPersona} unlocked={personaUnlocks} />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Quick Suggestions</h3>
                    <SuggestionChips />
                  </div>

                  {userProfile && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Your Status</span>
                        <Badge variant="secondary">
                          {userProfile.tier} - {userProfile.xp_level} XP
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <ConciergeChat persona={selectedPersona} context={context} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
