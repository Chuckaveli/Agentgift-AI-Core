"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Cultural data types
export interface CulturalLocale {
  code: string
  name: string
  flag: string
  country: string
  region: string
  currency?: string
  timezone?: string
  dateFormat?: string
}

export interface CulturalContextType {
  currentLocale: CulturalLocale
  setCurrentLocale: (locale: CulturalLocale) => void
  availableLocales: CulturalLocale[]
  isLoading: boolean
}

// Available locales with complete data
const AVAILABLE_LOCALES: CulturalLocale[] = [
  // North America
  {
    code: "en-US",
    name: "English (United States)",
    flag: "🇺🇸",
    country: "US",
    region: "North America",
    currency: "USD",
    timezone: "America/New_York",
    dateFormat: "MM/dd/yyyy",
  },
  {
    code: "en-CA",
    name: "English (Canada)",
    flag: "🇨🇦",
    country: "CA",
    region: "North America",
    currency: "CAD",
    timezone: "America/Toronto",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "fr-CA",
    name: "Français (Canada)",
    flag: "🇨🇦",
    country: "CA",
    region: "North America",
    currency: "CAD",
    timezone: "America/Toronto",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "es-MX",
    name: "Español (México)",
    flag: "🇲🇽",
    country: "MX",
    region: "North America",
    currency: "MXN",
    timezone: "America/Mexico_City",
    dateFormat: "dd/MM/yyyy",
  },

  // Europe
  {
    code: "en-GB",
    name: "English (United Kingdom)",
    flag: "🇬🇧",
    country: "GB",
    region: "Europe",
    currency: "GBP",
    timezone: "Europe/London",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "fr-FR",
    name: "Français (France)",
    flag: "🇫🇷",
    country: "FR",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Paris",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "de-DE",
    name: "Deutsch (Deutschland)",
    flag: "🇩🇪",
    country: "DE",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Berlin",
    dateFormat: "dd.MM.yyyy",
  },
  {
    code: "es-ES",
    name: "Español (España)",
    flag: "🇪🇸",
    country: "ES",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Madrid",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "it-IT",
    name: "Italiano (Italia)",
    flag: "🇮🇹",
    country: "IT",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Rome",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "pt-PT",
    name: "Português (Portugal)",
    flag: "🇵🇹",
    country: "PT",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Lisbon",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "nl-NL",
    name: "Nederlands (Nederland)",
    flag: "🇳🇱",
    country: "NL",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Amsterdam",
    dateFormat: "dd-MM-yyyy",
  },
  {
    code: "sv-SE",
    name: "Svenska (Sverige)",
    flag: "🇸🇪",
    country: "SE",
    region: "Europe",
    currency: "SEK",
    timezone: "Europe/Stockholm",
    dateFormat: "yyyy-MM-dd",
  },
  {
    code: "no-NO",
    name: "Norsk (Norge)",
    flag: "🇳🇴",
    country: "NO",
    region: "Europe",
    currency: "NOK",
    timezone: "Europe/Oslo",
    dateFormat: "dd.MM.yyyy",
  },
  {
    code: "da-DK",
    name: "Dansk (Danmark)",
    flag: "🇩🇰",
    country: "DK",
    region: "Europe",
    currency: "DKK",
    timezone: "Europe/Copenhagen",
    dateFormat: "dd-MM-yyyy",
  },
  {
    code: "fi-FI",
    name: "Suomi (Suomi)",
    flag: "🇫🇮",
    country: "FI",
    region: "Europe",
    currency: "EUR",
    timezone: "Europe/Helsinki",
    dateFormat: "dd.MM.yyyy",
  },
  {
    code: "pl-PL",
    name: "Polski (Polska)",
    flag: "🇵🇱",
    country: "PL",
    region: "Europe",
    currency: "PLN",
    timezone: "Europe/Warsaw",
    dateFormat: "dd.MM.yyyy",
  },
  {
    code: "ru-RU",
    name: "Русский (Россия)",
    flag: "🇷🇺",
    country: "RU",
    region: "Europe",
    currency: "RUB",
    timezone: "Europe/Moscow",
    dateFormat: "dd.MM.yyyy",
  },

  // Asia Pacific
  {
    code: "ja-JP",
    name: "日本語 (日本)",
    flag: "🇯🇵",
    country: "JP",
    region: "Asia Pacific",
    currency: "JPY",
    timezone: "Asia/Tokyo",
    dateFormat: "yyyy/MM/dd",
  },
  {
    code: "ko-KR",
    name: "한국어 (대한민국)",
    flag: "🇰🇷",
    country: "KR",
    region: "Asia Pacific",
    currency: "KRW",
    timezone: "Asia/Seoul",
    dateFormat: "yyyy.MM.dd",
  },
  {
    code: "zh-CN",
    name: "中文 (中国)",
    flag: "🇨🇳",
    country: "CN",
    region: "Asia Pacific",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    dateFormat: "yyyy/MM/dd",
  },
  {
    code: "zh-TW",
    name: "中文 (台灣)",
    flag: "🇹🇼",
    country: "TW",
    region: "Asia Pacific",
    currency: "TWD",
    timezone: "Asia/Taipei",
    dateFormat: "yyyy/MM/dd",
  },
  {
    code: "zh-HK",
    name: "中文 (香港)",
    flag: "🇭🇰",
    country: "HK",
    region: "Asia Pacific",
    currency: "HKD",
    timezone: "Asia/Hong_Kong",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "th-TH",
    name: "ไทย (ประเทศไทย)",
    flag: "🇹🇭",
    country: "TH",
    region: "Asia Pacific",
    currency: "THB",
    timezone: "Asia/Bangkok",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "vi-VN",
    name: "Tiếng Việt (Việt Nam)",
    flag: "🇻🇳",
    country: "VN",
    region: "Asia Pacific",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "id-ID",
    name: "Bahasa Indonesia (Indonesia)",
    flag: "🇮🇩",
    country: "ID",
    region: "Asia Pacific",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "ms-MY",
    name: "Bahasa Melayu (Malaysia)",
    flag: "🇲🇾",
    country: "MY",
    region: "Asia Pacific",
    currency: "MYR",
    timezone: "Asia/Kuala_Lumpur",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "tl-PH",
    name: "Filipino (Pilipinas)",
    flag: "🇵🇭",
    country: "PH",
    region: "Asia Pacific",
    currency: "PHP",
    timezone: "Asia/Manila",
    dateFormat: "MM/dd/yyyy",
  },
  {
    code: "hi-IN",
    name: "हिन्दी (भारत)",
    flag: "🇮🇳",
    country: "IN",
    region: "Asia Pacific",
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "en-IN",
    name: "English (India)",
    flag: "🇮🇳",
    country: "IN",
    region: "Asia Pacific",
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "en-AU",
    name: "English (Australia)",
    flag: "🇦🇺",
    country: "AU",
    region: "Asia Pacific",
    currency: "AUD",
    timezone: "Australia/Sydney",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "en-NZ",
    name: "English (New Zealand)",
    flag: "🇳🇿",
    country: "NZ",
    region: "Asia Pacific",
    currency: "NZD",
    timezone: "Pacific/Auckland",
    dateFormat: "dd/MM/yyyy",
  },

  // Middle East & Africa
  {
    code: "ar-SA",
    name: "العربية (السعودية)",
    flag: "🇸🇦",
    country: "SA",
    region: "Middle East & Africa",
    currency: "SAR",
    timezone: "Asia/Riyadh",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "ar-AE",
    name: "العربية (الإمارات)",
    flag: "🇦🇪",
    country: "AE",
    region: "Middle East & Africa",
    currency: "AED",
    timezone: "Asia/Dubai",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "he-IL",
    name: "עברית (ישראל)",
    flag: "🇮🇱",
    country: "IL",
    region: "Middle East & Africa",
    currency: "ILS",
    timezone: "Asia/Jerusalem",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "tr-TR",
    name: "Türkçe (Türkiye)",
    flag: "🇹🇷",
    country: "TR",
    region: "Middle East & Africa",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    dateFormat: "dd.MM.yyyy",
  },
  {
    code: "fa-IR",
    name: "فارسی (ایران)",
    flag: "🇮🇷",
    country: "IR",
    region: "Middle East & Africa",
    currency: "IRR",
    timezone: "Asia/Tehran",
    dateFormat: "yyyy/MM/dd",
  },
  {
    code: "sw-KE",
    name: "Kiswahili (Kenya)",
    flag: "🇰🇪",
    country: "KE",
    region: "Middle East & Africa",
    currency: "KES",
    timezone: "Africa/Nairobi",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "af-ZA",
    name: "Afrikaans (Suid-Afrika)",
    flag: "🇿🇦",
    country: "ZA",
    region: "Middle East & Africa",
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
    dateFormat: "yyyy/MM/dd",
  },
  {
    code: "en-ZA",
    name: "English (South Africa)",
    flag: "🇿🇦",
    country: "ZA",
    region: "Middle East & Africa",
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
    dateFormat: "yyyy/MM/dd",
  },

  // South America
  {
    code: "pt-BR",
    name: "Português (Brasil)",
    flag: "🇧🇷",
    country: "BR",
    region: "South America",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "es-AR",
    name: "Español (Argentina)",
    flag: "🇦🇷",
    country: "AR",
    region: "South America",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "es-CL",
    name: "Español (Chile)",
    flag: "🇨🇱",
    country: "CL",
    region: "South America",
    currency: "CLP",
    timezone: "America/Santiago",
    dateFormat: "dd-MM-yyyy",
  },
  {
    code: "es-CO",
    name: "Español (Colombia)",
    flag: "🇨🇴",
    country: "CO",
    region: "South America",
    currency: "COP",
    timezone: "America/Bogota",
    dateFormat: "dd/MM/yyyy",
  },
  {
    code: "es-PE",
    name: "Español (Perú)",
    flag: "🇵🇪",
    country: "PE",
    region: "South America",
    currency: "PEN",
    timezone: "America/Lima",
    dateFormat: "dd/MM/yyyy",
  },
]

// Default locale
const DEFAULT_LOCALE: CulturalLocale = AVAILABLE_LOCALES[0] // en-US

// Create context
const CulturalContext = createContext<CulturalContextType | undefined>(undefined)

// Context provider component
export function CulturalContextProvider({ children }: { children: React.ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState<CulturalLocale>(DEFAULT_LOCALE)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved locale from localStorage on mount
  useEffect(() => {
    try {
      const savedLocaleCode = localStorage.getItem("agentgift-cultural-locale")
      if (savedLocaleCode) {
        const savedLocale = AVAILABLE_LOCALES.find((locale) => locale.code === savedLocaleCode)
        if (savedLocale) {
          setCurrentLocale(savedLocale)
        }
      }
    } catch (error) {
      console.warn("Failed to load cultural locale from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save locale to localStorage when it changes
  const handleSetCurrentLocale = (locale: CulturalLocale) => {
    setCurrentLocale(locale)
    try {
      localStorage.setItem("agentgift-cultural-locale", locale.code)
    } catch (error) {
      console.warn("Failed to save cultural locale to localStorage:", error)
    }
  }

  const contextValue: CulturalContextType = {
    currentLocale,
    setCurrentLocale: handleSetCurrentLocale,
    availableLocales: AVAILABLE_LOCALES,
    isLoading,
  }

  return <CulturalContext.Provider value={contextValue}>{children}</CulturalContext.Provider>
}

// Hook to use cultural context
export function useCultural() {
  const context = useContext(CulturalContext)
  if (context === undefined) {
    throw new Error("useCultural must be used within a CulturalContextProvider")
  }
  return context
}

// Export alias for compatibility
export const useCulturalContext = useCultural
export const CulturalProvider = CulturalContextProvider

// Helper functions
export function formatCurrency(amount: number, locale: CulturalLocale): string {
  try {
    return new Intl.NumberFormat(locale.code, {
      style: "currency",
      currency: locale.currency || "USD",
    }).format(amount)
  } catch (error) {
    console.warn("Failed to format currency:", error)
    return `${locale.currency || "USD"} ${amount.toFixed(2)}`
  }
}

export function formatDate(date: Date, locale: CulturalLocale): string {
  try {
    return new Intl.DateTimeFormat(locale.code).format(date)
  } catch (error) {
    console.warn("Failed to format date:", error)
    return date.toLocaleDateString()
  }
}

export function getTimeZone(locale: CulturalLocale): string {
  return locale.timezone || "UTC"
}

export function getRegionLocales(region: string): CulturalLocale[] {
  return AVAILABLE_LOCALES.filter((locale) => locale.region === region)
}

export function getLocaleByCode(code: string): CulturalLocale | undefined {
  return AVAILABLE_LOCALES.find((locale) => locale.code === code)
}

