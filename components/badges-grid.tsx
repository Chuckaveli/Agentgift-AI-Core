"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Target, Gift, Users, Sparkles } from "lucide-react"

const badges = [
  {
    id: 1,
    name: "Gift Master",
    description: "Sent 100+ gifts",
    icon: Gift,
    rarity: "legendary",
    earned: true,
    progress: 100,
  },
  {
    id: 2,
    name: "Culture Champion",
    description: "Organized 50+ events",
    icon: Trophy,
    rarity: "epic",
    earned: true,
    progress: 100,
  },
  {
    id: 3,
    name: "Team Builder",
    description: "Connected 200+ employees",
    icon: Users,
    rarity: "rare",
    earned: true,
    progress: 100,
  },
  {
    id: 4,
    name: "Innovation Leader",
    description: "Launched 10+ initiatives",
    icon: Sparkles,
    rarity: "epic",
    earned: false,
    progress: 70,
  },
  {
    id: 5,
    name: "Engagement Expert",
    description: "95% participation rate",
    icon: Target,
    rarity: "rare",
    earned: false,
    progress: 85,
  },
  {
    id: 6,
    name: "Loyalty Legend",
    description: "5+ years of excellence",
    icon: Crown,
    rarity: "legendary",
    earned: false,
    progress: 60,
  },
]

const rarityColors = {
  common: "bg-gray-600",
  rare: "bg-blue-600",
  epic: "bg-purple-600",
  legendary: "bg-yellow-600",
}

const rarityBorders = {
  common: "border-gray-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-500",
}

export function BadgesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => {
        const IconComponent = badge.icon
        return (
          <Card
            key={badge.id}
            className={`bg-gray-900/50 border-2 transition-all duration-300 hover:scale-105 ${
              badge.earned ? rarityBorders[badge.rarity as keyof typeof rarityBorders] : "border-gray-700"
            } ${badge.earned ? "opacity-100" : "opacity-60"}`}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  badge.earned ? rarityColors[badge.rarity as keyof typeof rarityColors] : "bg-gray-700"
                }`}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{badge.name}</h3>
                <p className="text-sm text-gray-400">{badge.description}</p>

                <Badge
                  variant="secondary"
                  className={`${rarityColors[badge.rarity as keyof typeof rarityColors]} text-white border-0`}
                >
                  {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                </Badge>
              </div>

              {!badge.earned && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        rarityColors[badge.rarity as keyof typeof rarityColors]
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{badge.progress}% Complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

