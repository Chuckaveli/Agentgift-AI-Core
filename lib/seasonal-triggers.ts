"use client"

export interface Season {
  name: string
  startDate: string
  endDate: string
  badge: string
  xpMultiplier: number
  creditMultiplier: number
  description: string
  color: string
}

export const SEASONS: Season[] = [
  {
    name: "New Year",
    startDate: "2025-12-25",
    endDate: "2025-01-15",
    badge: "🎊 New Year",
    xpMultiplier: 2.0,
    creditMultiplier: 1.5,
    description: "Fresh starts and new beginnings",
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "Valentine's Day",
    startDate: "2025-02-01",
    endDate: "2025-02-20",
    badge: "💝 Valentine's",
    xpMultiplier: 2.5,
    creditMultiplier: 2.0,
    description: "Love is in the air",
    color: "from-pink-500 to-red-500",
  },
  {
    name: "Spring",
    startDate: "2025-03-15",
    endDate: "2025-05-15",
    badge: "🌸 Spring",
    xpMultiplier: 1.5,
    creditMultiplier: 1.2,
    description: "Renewal and growth season",
    color: "from-green-400 to-emerald-500",
  },
  {
    name: "Summer",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    badge: "☀️ Summer",
    xpMultiplier: 1.3,
    creditMultiplier: 1.1,
    description: "Fun in the sun",
    color: "from-yellow-400 to-orange-400",
  },
  {
    name: "Back to School",
    startDate: "2025-08-15",
    endDate: "2025-09-15",
    badge: "📚 Back to School",
    xpMultiplier: 2.0,
    creditMultiplier: 1.8,
    description: "Learning and new adventures",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Halloween",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    badge: "🎃 Halloween",
    xpMultiplier: 3.0,
    creditMultiplier: 2.5,
    description: "Spooky season thrills",
    color: "from-orange-500 to-purple-600",
  },
  {
    name: "Thanksgiving",
    startDate: "2025-11-15",
    endDate: "2025-11-30",
    badge: "🦃 Thanksgiving",
    xpMultiplier: 2.2,
    creditMultiplier: 1.8,
    description: "Gratitude and giving",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Holiday Season",
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    badge: "🎄 Holidays",
    xpMultiplier: 2.8,
    creditMultiplier: 2.5,
    description: "Most wonderful time of the year",
    color: "from-red-500 to-green-500",
  },
]

export function isSeasonActive(seasonName: string): boolean {
  const today = new Date()
  const season = SEASONS.find((s) => s.name === seasonName)

  if (!season) return false

  const startDate = new Date(season.startDate)
  const endDate = new Date(season.endDate)

  // Handle cross-year seasons (like New Year)
  if (startDate > endDate) {
    return today >= startDate || today <= endDate
  }

  return today >= startDate && today <= endDate
}

export function getActiveSeasons(): Season[] {
  return SEASONS.filter((season) => isSeasonActive(season.name))
}

export function getSeasonMultipliers(): { xp: number; credits: number } {
  const activeSeasons = getActiveSeasons()

  if (activeSeasons.length === 0) {
    return { xp: 1.0, credits: 1.0 }
  }

  // Use the highest multipliers from active seasons
  const maxXpMultiplier = Math.max(...activeSeasons.map((s) => s.xpMultiplier))
  const maxCreditMultiplier = Math.max(...activeSeasons.map((s) => s.creditMultiplier))

  return { xp: maxXpMultiplier, credits: maxCreditMultiplier }
}

export function getAllActiveMultipliers(): { xp: number; credits: number; seasons: Season[] } {
  const activeSeasons = getActiveSeasons()
  const multipliers = getSeasonMultipliers()

  return {
    xp: multipliers.xp,
    credits: multipliers.credits,
    seasons: activeSeasons,
  }
}

export function getSeasonalGreeting(): { message: string; emoji: string; color: string } {
  const activeSeasons = getActiveSeasons()

  if (activeSeasons.length === 0) {
    return {
      message: "Welcome to AgentGift.ai",
      emoji: "🎁",
      color: "from-purple-500 to-pink-500",
    }
  }

  // Return the first active season's greeting
  const activeSeason = activeSeasons[0]

  const greetings: Record<string, { message: string; emoji: string }> = {
    "New Year": { message: "New Year. New Gifts", emoji: "🎊" },
    "Valentine's Day": { message: "Love is in the Air", emoji: "💝" },
    Spring: { message: "Spring into Gifting", emoji: "🌸" },
    Summer: { message: "Hot Summer. Cool Gifts", emoji: "☀️" },
    "Back to School": { message: "Back to School Surprises", emoji: "📚" },
    Halloween: { message: "Spooky Good Gifts", emoji: "🎃" },
    Thanksgiving: { message: "Grateful for Great Gifts", emoji: "🦃" },
    "Holiday Season": { message: "Holiday Magic Awaits", emoji: "🎄" },
  }

  const greeting = greetings[activeSeason.name] || { message: "Seasonal Gifting", emoji: "🎁" }

  return {
    message: greeting.message,
    emoji: greeting.emoji,
    color: activeSeason.color,
  }
}

export function testSeasonalTriggers(): void {
  console.log("🎯 Testing Seasonal Triggers")
  console.log("Current Date:", new Date().toISOString())

  SEASONS.forEach((season) => {
    const isActive = isSeasonActive(season.name)
    console.log(`${season.badge} ${season.name}: ${isActive ? "✅ ACTIVE" : "❌ Inactive"}`)
  })

  const multipliers = getSeasonMultipliers()
  console.log(`Current Multipliers: XP ${multipliers.xp}x, Credits ${multipliers.credits}x`)

  const greeting = getSeasonalGreeting()
  console.log(`Current Greeting: ${greeting.emoji} ${greeting.message}`)
}
