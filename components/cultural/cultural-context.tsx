"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CulturalContextType {
  selectedLocale: string
  selectedCountry: string
  culturalPreferences: {
    giftingStyle: string
    communicationStyle: string
    colorPreferences: string[]
    holidayTraditions: string[]
  }
  setSelectedLocale: (locale: string) => void
  setSelectedCountry: (country: string) => void
  updateCulturalPreferences: (preferences: Partial<CulturalContextType["culturalPreferences"]>) => void
}

const CulturalContext = createContext<CulturalContextType | undefined>(undefined)

interface CulturalContextProviderProps {
  children: ReactNode
}

export function CulturalContextProvider({ children }: CulturalContextProviderProps) {
  const [selectedLocale, setSelectedLocale] = useState("en-US")
  const [selectedCountry, setSelectedCountry] = useState("US")
  const [culturalPreferences, setCulturalPreferences] = useState({
    giftingStyle: "western",
    communicationStyle: "direct",
    colorPreferences: ["blue", "purple", "pink"],
    holidayTraditions: ["christmas", "birthday", "anniversary"],
  })

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("agentgift-locale")
      const savedCountry = localStorage.getItem("agentgift-country")
      const savedPreferences = localStorage.getItem("agentgift-cultural-preferences")

      if (savedLocale) setSelectedLocale(savedLocale)
      if (savedCountry) setSelectedCountry(savedCountry)
      if (savedPreferences) {
        try {
          setCulturalPreferences(JSON.parse(savedPreferences))
        } catch (error) {
          console.error("Error parsing cultural preferences:", error)
        }
      }
    }
  }, [])

  // Save to localStorage when values change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agentgift-locale", selectedLocale)
    }
  }, [selectedLocale])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agentgift-country", selectedCountry)
    }
  }, [selectedCountry])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agentgift-cultural-preferences", JSON.stringify(culturalPreferences))
    }
  }, [culturalPreferences])

  const updateCulturalPreferences = (newPreferences: Partial<typeof culturalPreferences>) => {
    setCulturalPreferences((prev) => ({ ...prev, ...newPreferences }))
  }

  const value: CulturalContextType = {
    selectedLocale,
    selectedCountry,
    culturalPreferences,
    setSelectedLocale,
    setSelectedCountry,
    updateCulturalPreferences,
  }

  return <CulturalContext.Provider value={value}>{children}</CulturalContext.Provider>
}

// Export alias for compatibility
export const CulturalProvider = CulturalContextProvider

export function useCulturalContext() {
  const context = useContext(CulturalContext)
  if (context === undefined) {
    throw new Error("useCulturalContext must be used within a CulturalProvider")
  }
  return context
}
