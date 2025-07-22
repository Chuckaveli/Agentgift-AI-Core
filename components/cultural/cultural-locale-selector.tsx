"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCulturalContext } from "./cultural-context"
import { Globe, MapPin, Palette, Calendar } from "lucide-react"

interface Locale {
  code: string
  name: string
  flag: string
  country: string
  region: string
}

const locales: Locale[] = [
  // North America
  { code: "en-US", name: "English (United States)", flag: "🇺🇸", country: "US", region: "North America" },
  { code: "en-CA", name: "English (Canada)", flag: "🇨🇦", country: "CA", region: "North America" },
  { code: "fr-CA", name: "Français (Canada)", flag: "🇨🇦", country: "CA", region: "North America" },
  { code: "es-MX", name: "Español (México)", flag: "🇲🇽", country: "MX", region: "North America" },

  // Europe
  { code: "en-GB", name: "English (United Kingdom)", flag: "🇬🇧", country: "GB", region: "Europe" },
  { code: "fr-FR", name: "Français (France)", flag: "🇫🇷", country: "FR", region: "Europe" },
  { code: "de-DE", name: "Deutsch (Deutschland)", flag: "🇩🇪", country: "DE", region: "Europe" },
  { code: "es-ES", name: "Español (España)", flag: "🇪🇸", country: "ES", region: "Europe" },
  { code: "it-IT", name: "Italiano (Italia)", flag: "🇮🇹", country: "IT", region: "Europe" },
  { code: "pt-PT", name: "Português (Portugal)", flag: "🇵🇹", country: "PT", region: "Europe" },
  { code: "nl-NL", name: "Nederlands (Nederland)", flag: "🇳🇱", country: "NL", region: "Europe" },
  { code: "sv-SE", name: "Svenska (Sverige)", flag: "🇸🇪", country: "SE", region: "Europe" },
  { code: "da-DK", name: "Dansk (Danmark)", flag: "🇩🇰", country: "DK", region: "Europe" },
  { code: "no-NO", name: "Norsk (Norge)", flag: "🇳🇴", country: "NO", region: "Europe" },
  { code: "fi-FI", name: "Suomi (Suomi)", flag: "🇫🇮", country: "FI", region: "Europe" },
  { code: "pl-PL", name: "Polski (Polska)", flag: "🇵🇱", country: "PL", region: "Europe" },
  { code: "ru-RU", name: "Русский (Россия)", flag: "🇷🇺", country: "RU", region: "Europe" },

  // Asia Pacific
  { code: "zh-CN", name: "中文 (中国)", flag: "🇨🇳", country: "CN", region: "Asia Pacific" },
  { code: "zh-TW", name: "中文 (台灣)", flag: "🇹🇼", country: "TW", region: "Asia Pacific" },
  { code: "ja-JP", name: "日本語 (日本)", flag: "🇯🇵", country: "JP", region: "Asia Pacific" },
  { code: "ko-KR", name: "한국어 (대한민국)", flag: "🇰🇷", country: "KR", region: "Asia Pacific" },
  { code: "hi-IN", name: "हिन्दी (भारत)", flag: "🇮🇳", country: "IN", region: "Asia Pacific" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳", country: "IN", region: "Asia Pacific" },
  { code: "th-TH", name: "ไทย (ประเทศไทย)", flag: "🇹🇭", country: "TH", region: "Asia Pacific" },
  { code: "vi-VN", name: "Tiếng Việt (Việt Nam)", flag: "🇻🇳", country: "VN", region: "Asia Pacific" },
  { code: "id-ID", name: "Bahasa Indonesia (Indonesia)", flag: "🇮🇩", country: "ID", region: "Asia Pacific" },
  { code: "ms-MY", name: "Bahasa Melayu (Malaysia)", flag: "🇲🇾", country: "MY", region: "Asia Pacific" },
  { code: "en-AU", name: "English (Australia)", flag: "🇦🇺", country: "AU", region: "Asia Pacific" },
  { code: "en-NZ", name: "English (New Zealand)", flag: "🇳🇿", country: "NZ", region: "Asia Pacific" },

  // Middle East & Africa
  { code: "ar-SA", name: "العربية (السعودية)", flag: "🇸🇦", country: "SA", region: "Middle East & Africa" },
  { code: "ar-AE", name: "العربية (الإمارات)", flag: "🇦🇪", country: "AE", region: "Middle East & Africa" },
  { code: "he-IL", name: "עברית (ישראל)", flag: "🇮🇱", country: "IL", region: "Middle East & Africa" },
  { code: "tr-TR", name: "Türkçe (Türkiye)", flag: "🇹🇷", country: "TR", region: "Middle East & Africa" },
  { code: "en-ZA", name: "English (South Africa)", flag: "🇿🇦", country: "ZA", region: "Middle East & Africa" },
  { code: "af-ZA", name: "Afrikaans (Suid-Afrika)", flag: "🇿🇦", country: "ZA", region: "Middle East & Africa" },

  // South America
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", country: "BR", region: "South America" },
  { code: "es-AR", name: "Español (Argentina)", flag: "🇦🇷", country: "AR", region: "South America" },
  { code: "es-CL", name: "Español (Chile)", flag: "🇨🇱", country: "CL", region: "South America" },
  { code: "es-CO", name: "Español (Colombia)", flag: "🇨🇴", country: "CO", region: "South America" },
]

const regions = ["North America", "Europe", "Asia Pacific", "Middle East & Africa", "South America"]

const culturalStyles = {
  giftingStyle: [
    { value: "western", label: "Western Style", description: "Direct, practical, individual focus" },
    { value: "eastern", label: "Eastern Style", description: "Symbolic, respectful, group harmony" },
    { value: "collectivist", label: "Collectivist", description: "Community-focused, shared experiences" },
    { value: "individualist", label: "Individualist", description: "Personal preferences, unique items" },
  ],
  communicationStyle: [
    { value: "direct", label: "Direct", description: "Clear, straightforward communication" },
    { value: "indirect", label: "Indirect", description: "Subtle, context-dependent messaging" },
    { value: "formal", label: "Formal", description: "Respectful, traditional approach" },
    { value: "casual", label: "Casual", description: "Relaxed, friendly interaction" },
  ],
}

export function CulturalLocaleSelector() {
  const {
    selectedLocale,
    selectedCountry,
    culturalPreferences,
    setSelectedLocale,
    setSelectedCountry,
    updateCulturalPreferences,
  } = useCulturalContext()

  const [selectedRegion, setSelectedRegion] = useState<string>("all")

  const filteredLocales =
    selectedRegion === "all" ? locales : locales.filter((locale) => locale.region === selectedRegion)

  const currentLocale = locales.find((locale) => locale.code === selectedLocale)

  const handleLocaleChange = (localeCode: string) => {
    const locale = locales.find((l) => l.code === localeCode)
    if (locale) {
      setSelectedLocale(localeCode)
      setSelectedCountry(locale.country)
    }
  }

  const handleStyleChange = (styleType: keyof typeof culturalStyles, value: string) => {
    updateCulturalPreferences({ [styleType]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cultural & Language Settings
          </CardTitle>
          <CardDescription>Customize your experience based on your cultural preferences and language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="locale" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="locale">Language & Region</TabsTrigger>
              <TabsTrigger value="style">Cultural Style</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="locale" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Language & Country</label>
                  <Select value={selectedLocale} onValueChange={handleLocaleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language and country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredLocales.map((locale) => (
                        <SelectItem key={locale.code} value={locale.code}>
                          <div className="flex items-center gap-2">
                            <span>{locale.flag}</span>
                            <span>{locale.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentLocale && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      Selected: {currentLocale.flag} {currentLocale.name}
                    </span>
                    <Badge variant="secondary">{currentLocale.region}</Badge>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Gifting Style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {culturalStyles.giftingStyle.map((style) => (
                      <Card
                        key={style.value}
                        className={`cursor-pointer transition-colors ${
                          culturalPreferences.giftingStyle === style.value
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleStyleChange("giftingStyle", style.value)}
                      >
                        <CardContent className="p-4">
                          <div className="font-medium">{style.label}</div>
                          <div className="text-sm text-muted-foreground mt-1">{style.description}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Communication Style</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {culturalStyles.communicationStyle.map((style) => (
                      <Card
                        key={style.value}
                        className={`cursor-pointer transition-colors ${
                          culturalPreferences.communicationStyle === style.value
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleStyleChange("communicationStyle", style.value)}
                      >
                        <CardContent className="p-4">
                          <div className="font-medium">{style.label}</div>
                          <div className="text-sm text-muted-foreground mt-1">{style.description}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Holiday Traditions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {culturalPreferences.holidayTraditions.map((tradition) => (
                      <Badge key={tradition} variant="secondary">
                        {tradition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Color Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {culturalPreferences.colorPreferences.map((color) => (
                      <Badge key={color} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Settings Summary</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Language: {currentLocale?.name}</div>
                    <div>Gifting Style: {culturalPreferences.giftingStyle}</div>
                    <div>Communication: {culturalPreferences.communicationStyle}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={() => window.location.reload()}>Apply Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
