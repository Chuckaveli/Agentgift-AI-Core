"use client"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface LocaleHoliday {
  id: string
  name: string
  date: string
  region: string
  country_code: string
  cultural_significance: string
  gift_traditions: string[]
  color_themes: string[]
  symbols: string[]
  is_active: boolean
  xp_bonus_multiplier: number
  created_at: string
}

export interface CulturalGiftSuggestion {
  category: string
  items: string[]
  cultural_context: string
  price_range: string
  appropriateness_level: "high" | "medium" | "low"
}

export class LocaleHolidayService {
  static async fetchHolidaysByLocale(locale: string): Promise<LocaleHoliday[]> {
    try {
      const countryCode = locale.split("-")[1] || "US"
      const currentDate = new Date().toISOString().split("T")[0]

      const { data: holidays, error } = await supabase
        .from("global_holidays")
        .select("*")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .gte("date", currentDate)
        .order("date", { ascending: true })
        .limit(20)

      if (error) throw error

      return holidays || []
    } catch (error) {
      console.error("Error fetching holidays:", error)
      return this.getFallbackHolidays(locale)
    }
  }

  static async fetchUpcomingHolidays(locale: string, days = 30): Promise<LocaleHoliday[]> {
    try {
      const countryCode = locale.split("-")[1] || "US"
      const currentDate = new Date()
      const futureDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000)

      const { data: holidays, error } = await supabase
        .from("global_holidays")
        .select("*")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .gte("date", currentDate.toISOString().split("T")[0])
        .lte("date", futureDate.toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (error) throw error

      return holidays || []
    } catch (error) {
      console.error("Error fetching upcoming holidays:", error)
      return []
    }
  }

  static async fetchHolidayById(holidayId: string): Promise<LocaleHoliday | null> {
    try {
      const { data: holiday, error } = await supabase.from("global_holidays").select("*").eq("id", holidayId).single()

      if (error) throw error

      return holiday
    } catch (error) {
      console.error("Error fetching holiday by ID:", error)
      return null
    }
  }

  static getCulturalGiftSuggestions(holiday: LocaleHoliday): CulturalGiftSuggestion[] {
    const suggestions: CulturalGiftSuggestion[] = []

    // Map gift traditions to specific suggestions
    holiday.gift_traditions.forEach((tradition) => {
      switch (tradition) {
        case "flowers":
          suggestions.push({
            category: "Flowers & Plants",
            items: ["Bouquet", "Potted plants", "Flower arrangements"],
            cultural_context: "Traditional floral gifts for celebration",
            price_range: "$20-100",
            appropriateness_level: "high",
          })
          break
        case "sweets":
          suggestions.push({
            category: "Sweets & Treats",
            items: ["Traditional candies", "Chocolate boxes", "Local desserts"],
            cultural_context: "Sweet treats to share joy",
            price_range: "$15-50",
            appropriateness_level: "high",
          })
          break
        case "jewelry":
          suggestions.push({
            category: "Jewelry & Accessories",
            items: ["Traditional jewelry", "Modern accessories", "Cultural symbols"],
            cultural_context: "Meaningful adornments for special occasions",
            price_range: "$50-500",
            appropriateness_level: "medium",
          })
          break
        case "home_decor":
          suggestions.push({
            category: "Home & Decor",
            items: ["Cultural decorations", "Seasonal items", "Traditional crafts"],
            cultural_context: "Items to beautify living spaces",
            price_range: "$25-200",
            appropriateness_level: "high",
          })
          break
        case "food":
          suggestions.push({
            category: "Food & Beverages",
            items: ["Traditional foods", "Specialty ingredients", "Cultural drinks"],
            cultural_context: "Sharing traditional flavors",
            price_range: "$20-100",
            appropriateness_level: "high",
          })
          break
        default:
          suggestions.push({
            category: "Cultural Gifts",
            items: ["Traditional items", "Cultural artifacts", "Symbolic gifts"],
            cultural_context: `Traditional ${tradition} for ${holiday.name}`,
            price_range: "$30-150",
            appropriateness_level: "medium",
          })
      }
    })

    return suggestions
  }

  static getHolidayXPBonus(holiday: LocaleHoliday): number {
    return holiday.xp_bonus_multiplier || 1.5
  }

  static isHolidayActive(holiday: LocaleHoliday): boolean {
    const today = new Date()
    const holidayDate = new Date(holiday.date)
    const daysBefore = 7 // Holiday is "active" 7 days before
    const daysAfter = 1 // and 1 day after

    const startDate = new Date(holidayDate.getTime() - daysBefore * 24 * 60 * 60 * 1000)
    const endDate = new Date(holidayDate.getTime() + daysAfter * 24 * 60 * 60 * 1000)

    return today >= startDate && today <= endDate
  }

  private static getFallbackHolidays(locale: string): LocaleHoliday[] {
    const countryCode = locale.split("-")[1] || "US"
    const currentYear = new Date().getFullYear()

    const fallbackHolidays: Record<string, LocaleHoliday[]> = {
      US: [
        {
          id: "thanksgiving-us",
          name: "Thanksgiving",
          date: `${currentYear}-11-23`,
          region: "North America",
          country_code: "US",
          cultural_significance: "Family gratitude celebration with traditional feast",
          gift_traditions: ["host_gifts", "gratitude_cards", "food", "flowers"],
          color_themes: ["orange", "brown", "red", "gold"],
          symbols: ["turkey", "cornucopia", "autumn_leaves"],
          is_active: true,
          xp_bonus_multiplier: 1.5,
          created_at: new Date().toISOString(),
        },
        {
          id: "christmas-us",
          name: "Christmas",
          date: `${currentYear}-12-25`,
          region: "North America",
          country_code: "US",
          cultural_significance: "Christian celebration of Jesus Christ's birth",
          gift_traditions: ["wrapped_gifts", "toys", "jewelry", "electronics"],
          color_themes: ["red", "green", "gold", "silver"],
          symbols: ["christmas_tree", "santa", "reindeer"],
          is_active: true,
          xp_bonus_multiplier: 2.0,
          created_at: new Date().toISOString(),
        },
      ],
      JP: [
        {
          id: "new-year-jp",
          name: "Shogatsu (New Year)",
          date: `${currentYear + 1}-01-01`,
          region: "Asia",
          country_code: "JP",
          cultural_significance: "Most important Japanese holiday celebrating new beginnings",
          gift_traditions: ["otoshidama", "nengajo", "omamori", "food"],
          color_themes: ["red", "white", "gold"],
          symbols: ["pine", "bamboo", "plum"],
          is_active: true,
          xp_bonus_multiplier: 2.0,
          created_at: new Date().toISOString(),
        },
      ],
      IN: [
        {
          id: "diwali-in",
          name: "Diwali",
          date: `${currentYear}-11-12`,
          region: "Asia",
          country_code: "IN",
          cultural_significance: "Festival of lights celebrating good over evil",
          gift_traditions: ["sweets", "jewelry", "home_decor", "flowers"],
          color_themes: ["gold", "red", "orange", "yellow"],
          symbols: ["diya", "lotus", "rangoli"],
          is_active: true,
          xp_bonus_multiplier: 1.8,
          created_at: new Date().toISOString(),
        },
      ],
    }

    return fallbackHolidays[countryCode] || []
  }
}

export default LocaleHolidayService
