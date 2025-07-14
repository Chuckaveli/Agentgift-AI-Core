"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { useCulturalContext } from "./cultural-context"

const SUPPORTED_LOCALES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸", region: "North America" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧", region: "Europe" },
  { code: "es-ES", name: "Español", flag: "🇪🇸", region: "Europe" },
  { code: "es-MX", name: "Español (México)", flag: "🇲🇽", region: "North America" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷", region: "Europe" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪", region: "Europe" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹", region: "Europe" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", region: "South America" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵", region: "Asia" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷", region: "Asia" },
  { code: "zh-CN", name: "中文 (简体)", flag: "🇨🇳", region: "Asia" },
  { code: "zh-TW", name: "中文 (繁體)", flag: "🇹🇼", region: "Asia" },
  { code: "hi-IN", name: "हिन्दी", flag: "🇮🇳", region: "Asia" },
  { code: "ar-SA", name: "العربية", flag: "🇸🇦", region: "Middle East" },
  { code: "ru-RU", name: "Русский", flag: "🇷🇺", region: "Europe" },
  { code: "nl-NL", name: "Nederlands", flag: "🇳🇱", region: "Europe" },
  { code: "sv-SE", name: "Svenska", flag: "🇸🇪", region: "Europe" },
  { code: "da-DK", name: "Dansk", flag: "🇩🇰", region: "Europe" },
  { code: "no-NO", name: "Norsk", flag: "🇳🇴", region: "Europe" },
  { code: "fi-FI", name: "Suomi", flag: "🇫🇮", region: "Europe" },
]

const REGIONS = ["North America", "South America", "Europe", "Asia", "Middle East", "Africa", "Oceania"]

export function CulturalLocaleSelector() {
  const { currentLocale, setLocale, isLoading } = useCulturalContext()
  const [isOpen, setIsOpen] = useState(false)

  const currentLocaleData = SUPPORTED_LOCALES.find((locale) => locale.code === currentLocale) || SUPPORTED_LOCALES[0]

  const groupedLocales = REGIONS.reduce(
    (acc, region) => {
      acc[region] = SUPPORTED_LOCALES.filter((locale) => locale.region === region)
      return acc
    },
    {} as Record<string, typeof SUPPORTED_LOCALES>,
  )

  const handleLocaleChange = async (localeCode: string) => {
    await setLocale(localeCode)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Globe className="w-4 h-4" />
          <span className="text-lg">{currentLocaleData.flag}</span>
          <span className="hidden sm:inline">{currentLocaleData.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Select Your Region & Language</div>
          {Object.entries(groupedLocales).map(([region, locales]) => (
            <div key={region}>
              <div className="text-xs font-medium text-gray-500 mt-3 mb-1 px-2">{region}</div>
              {locales.map((locale) => (
                <DropdownMenuItem
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale.code)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{locale.flag}</span>
                    <span className="text-sm">{locale.name}</span>
                  </div>
                  {currentLocale === locale.code && <Check className="w-4 h-4 text-green-600" />}
                </DropdownMenuItem>
              ))}
              {region !== "Oceania" && <DropdownMenuSeparator />}
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="text-xs text-gray-500 text-center">More languages coming soon!</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
