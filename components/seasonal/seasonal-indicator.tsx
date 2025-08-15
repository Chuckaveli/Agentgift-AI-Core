"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { getActiveSeasons, getSeasonMultipliers, type Season } from "@/lib/seasonal-triggers"

export function SeasonalIndicator() {
  const [activeSeasons, setActiveSeasons] = useState<Season[]>([])
  const [multipliers, setMultipliers] = useState({ xp: 1.0, credits: 1.0 })

  useEffect(() => {
    const seasons = getActiveSeasons()
    const mults = getSeasonMultipliers()

    setActiveSeasons(seasons)
    setMultipliers(mults)
  }, [])

  if (activeSeasons.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      {activeSeasons.map((season) => (
        <Card key={season.name} className={`bg-gradient-to-r ${season.color} border-0 text-white mb-4`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{season.badge}</h3>
                  <p className="text-white/80 text-sm">{season.description}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {season.xpMultiplier > 1 && (
                  <Badge className="bg-white/20 text-white border-white/30">{season.xpMultiplier}x XP</Badge>
                )}
                {season.creditMultiplier > 1 && (
                  <Badge className="bg-white/20 text-white border-white/30">{season.creditMultiplier}x Credits</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

