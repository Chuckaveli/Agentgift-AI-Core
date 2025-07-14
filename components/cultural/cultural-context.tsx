"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface CulturalHoliday {
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
}

export interface CulturalPreference {
  locale: string
  gift_giving_style: "direct" | "subtle" | "ceremonial" | "casual"
  emotional_expression: "reserved" | "moderate" | "expressive" | "very_expressive"
  color_preferences: string[]
  taboo_items: string[]
  preferred_occasions: string[]
  communication_style: "formal" | "friendly" | "warm" | "professional"
  holiday_importance: "high" | "medium" | "low"
}

export interface CulturalContext {
  currentLocale: string
  culturalPreferences: CulturalPreference | null
  upcomingHolidays: CulturalHoliday[]
  setLocale: (locale: string) => Promise<void>
  getCulturalGiftFilters: () => string[]
  getLocalizedPersonaTone: (personaId: string) => string
  isLoading: boolean
  error: string | null
}

const CulturalContextProvider = createContext<CulturalContext | undefined>(undefined)

const DEFAULT_CULTURAL_PREFERENCES: Record<string, CulturalPreference> = {
  "en-US": {
    locale: "en-US",
    gift_giving_style: "direct",
    emotional_expression: "moderate",
    color_preferences: ["red", "blue", "green", "gold"],
    taboo_items: [],
    preferred_occasions: ["birthday", "christmas", "valentines", "thanksgiving"],
    communication_style: "friendly",
    holiday_importance: "high",
  },
  "ja-JP": {
    locale: "ja-JP",
    gift_giving_style: "ceremonial",
    emotional_expression: "reserved",
    color_preferences: ["white", "red", "gold", "pink"],
    taboo_items: ["knives", "clocks", "white_flowers"],
    preferred_occasions: ["new_year", "golden_week", "obon", "birthday"],
    communication_style: "formal",
    holiday_importance: "high",
  },
  "es-MX": {
    locale: "es-MX",
    gift_giving_style: "ceremonial",
    emotional_expression: "expressive",
    color_preferences: ["red", "green", "gold", "pink", "purple"],
    taboo_items: ["yellow_flowers", "purple_flowers"],
    preferred_occasions: ["dia_de_muertos", "christmas", "birthday", "mothers_day"],
    communication_style: "warm",
    holiday_importance: "high",
  },
  "hi-IN": {
    locale: "hi-IN",
    gift_giving_style: "ceremonial",
    emotional_expression: "expressive",
    color_preferences: ["red", "gold", "orange", "yellow", "green"],
    taboo_items: ["leather", "alcohol"],
    preferred_occasions: ["diwali", "holi", "raksha_bandhan", "birthday"],
    communication_style: "warm",
    holiday_importance: "high",
  },
  "de-DE": {
    locale: "de-DE",
    gift_giving_style: "direct",
    emotional_expression: "reserved",
    color_preferences: ["red", "green", "gold", "blue"],
    taboo_items: ["even_numbered_flowers"],
    preferred_occasions: ["christmas", "birthday", "easter", "oktoberfest"],
    communication_style: "formal",
    holiday_importance: "medium",
  },
}

export function CulturalProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState("en-US")
  const [culturalPreferences, setCulturalPreferences] = useState<CulturalPreference | null>(null)
  const [upcomingHolidays, setUpcomingHolidays] = useState<CulturalHoliday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeCulturalContext()
  }, [])

  const initializeCulturalContext = async () => {
    try {
      setIsLoading(true)

      // Get user's saved locale or detect from browser
      const savedLocale = localStorage.getItem("agentgift_locale") || navigator.language || "en-US"

      await setLocale(savedLocale)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize cultural context")
    } finally {
      setIsLoading(false)
    }
  }

  const setLocale = async (locale: string) => {
    try {
      setCurrentLocale(locale)

      // Get cultural preferences for this locale
      const preferences = DEFAULT_CULTURAL_PREFERENCES[locale] || DEFAULT_CULTURAL_PREFERENCES["en-US"]
      setCulturalPreferences(preferences)

      // Load holidays for this locale
      await loadHolidaysForLocale(locale)

      // Save to localStorage
      localStorage.setItem("agentgift_locale", locale)

      // Update user profile if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("user_profiles")
          .update({
            preferred_locale: locale,
            cultural_preferences: preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set locale")
    }
  }

  const loadHolidaysForLocale = async (locale: string) => {
    try {
      const countryCode = locale.split("-")[1]
      const { data: holidays, error } = await supabase
        .from("global_holidays")
        .select("*")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(10)

      if (error) throw error

      setUpcomingHolidays(holidays || [])
    } catch (err) {
      console.error("Error loading holidays:", err)
      // Set some default holidays based on locale
      setUpcomingHolidays(getDefaultHolidaysForLocale(locale))
    }
  }

  const getDefaultHolidaysForLocale = (locale: string): CulturalHoliday[] => {
    const countryCode = locale.split("-")[1]
    const currentYear = new Date().getFullYear()

    const holidayMap: Record<string, CulturalHoliday[]> = {
      US: [
        {
          id: "thanksgiving-us",
          name: "Thanksgiving",
          date: `${currentYear}-11-23`,
          region: "North America",
          country_code: "US",
          cultural_significance: "Family gratitude celebration",
          gift_traditions: ["host_gifts", "gratitude_cards"],
          color_themes: ["orange", "brown", "red", "gold"],
          symbols: ["turkey", "cornucopia", "autumn_leaves"],
          is_active: true,
        },
      ],
      JP: [
        {
          id: "new-year-jp",
          name: "Shogatsu (New Year)",
          date: `${currentYear + 1}-01-01`,
          region: "Asia",
          country_code: "JP",
          cultural_significance: "Most important Japanese holiday",
          gift_traditions: ["otoshidama", "nengajo", "omamori"],
          color_themes: ["red", "white", "gold"],
          symbols: ["pine", "bamboo", "plum"],
          is_active: true,
        },
      ],
      IN: [
        {
          id: "diwali-in",
          name: "Diwali",
          date: `${currentYear}-11-12`,
          region: "Asia",
          country_code: "IN",
          cultural_significance: "Festival of lights",
          gift_traditions: ["sweets", "gold", "diyas", "rangoli"],
          color_themes: ["gold", "red", "orange", "yellow"],
          symbols: ["diya", "lotus", "rangoli"],
          is_active: true,
        },
      ],
    }

    return holidayMap[countryCode] || []
  }

  const getCulturalGiftFilters = (): string[] => {
    if (!culturalPreferences) return []

    const filters: string[] = []

    // Add locale-specific filters
    filters.push(`locale:${culturalPreferences.locale}`)
    filters.push(`style:${culturalPreferences.gift_giving_style}`)
    filters.push(`expression:${culturalPreferences.emotional_expression}`)

    // Add color preferences
    culturalPreferences.color_preferences.forEach((color) => {
      filters.push(`color:${color}`)
    })

    // Add preferred occasions
    culturalPreferences.preferred_occasions.forEach((occasion) => {
      filters.push(`occasion:${occasion}`)
    })

    // Add "made in" filter for local preference
    const countryCode = culturalPreferences.locale.split("-")[1]
    filters.push(`made_in:${countryCode}`)

    return filters
  }

  const getLocalizedPersonaTone = (personaId: string): string => {
    if (!culturalPreferences) return "friendly"

    const toneMap: Record<string, Record<string, string>> = {
      avelyn: {
        formal: "respectful and caring",
        friendly: "warm and empathetic",
        warm: "affectionate and understanding",
        professional: "supportive and considerate",
      },
      galen: {
        formal: "precise and informative",
        friendly: "enthusiastic and helpful",
        warm: "passionate and encouraging",
        professional: "expert and reliable",
      },
      zola: {
        formal: "elegant and refined",
        friendly: "sophisticated and approachable",
        warm: "luxurious and personal",
        professional: "exclusive and knowledgeable",
      },
    }

    return toneMap[personaId]?.[culturalPreferences.communication_style] || "friendly"
  }

  const contextValue: CulturalContext = {
    currentLocale,
    culturalPreferences,
    upcomingHolidays,
    setLocale,
    getCulturalGiftFilters,
    getLocalizedPersonaTone,
    isLoading,
    error,
  }

  return <CulturalContextProvider.Provider value={contextValue}>{children}</CulturalContextProvider.Provider>
}

export function useCulturalContext() {
  const context = useContext(CulturalContextProvider)
  if (context === undefined) {
    throw new Error("useCulturalContext must be used within a CulturalProvider")
  }
  return context
}
