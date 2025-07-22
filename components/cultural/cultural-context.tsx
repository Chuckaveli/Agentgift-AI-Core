"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface CulturalContextType {
  selectedLocale: string
  setSelectedLocale: (locale: string) => void
  culturalData: any
  isLoading: boolean
}

const CulturalContext = createContext<CulturalContextType | undefined>(undefined)

export function useCulturalContext() {
  const context = useContext(CulturalContext)
  if (context === undefined) {
    throw new Error("useCulturalContext must be used within a CulturalProvider")
  }
  return context
}

interface CulturalProviderProps {
  children: ReactNode
}

export function CulturalProvider({ children }: CulturalProviderProps) {
  const [selectedLocale, setSelectedLocale] = useState("en-US")
  const [culturalData, setCulturalData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load saved locale from localStorage if available
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("agentgift-locale")
      if (savedLocale) {
        setSelectedLocale(savedLocale)
      }
    }
  }, [])

  useEffect(() => {
    // Save locale to localStorage when it changes
    if (typeof window !== "undefined") {
      localStorage.setItem("agentgift-locale", selectedLocale)
    }

    // Load cultural data for the selected locale
    setIsLoading(true)
    // Simulate API call - replace with actual cultural data fetching
    setTimeout(() => {
      setCulturalData({
        locale: selectedLocale,
        holidays: [],
        traditions: [],
        giftingCustoms: [],
      })
      setIsLoading(false)
    }, 500)
  }, [selectedLocale])

  const value = {
    selectedLocale,
    setSelectedLocale,
    culturalData,
    isLoading,
  }

  return <CulturalContext.Provider value={value}>{children}</CulturalContext.Provider>
}
