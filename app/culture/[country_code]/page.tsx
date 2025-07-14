"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Gift, Heart, AlertTriangle, CheckCircle, Globe, Star, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import LocaleHolidayService, { type LocaleHoliday, type CulturalGiftSuggestion } from "@/lib/fetchLocaleHolidayData"

const COUNTRY_INFO: Record<
  string,
  {
    name: string
    flag: string
    region: string
    culturalDos: string[]
    culturalDonts: string[]
    giftingEtiquette: string[]
    commonGreetings: string[]
  }
> = {
  us: {
    name: "United States",
    flag: "🇺🇸",
    region: "North America",
    culturalDos: [
      "Be direct and friendly in communication",
      "Arrive on time for appointments",
      "Tip service workers (15-20%)",
      "Respect personal space (arm's length)",
      "Make eye contact during conversations",
    ],
    culturalDonts: [
      "Don't discuss politics or religion casually",
      "Don't be overly familiar with strangers",
      "Don't assume everyone speaks English",
      "Don't ignore personal boundaries",
    ],
    giftingEtiquette: [
      "Wrap gifts nicely with ribbons",
      "Include a thoughtful card",
      "Open gifts immediately when received",
      "Express genuine gratitude",
      "Reciprocate during holidays",
    ],
    commonGreetings: ["Hello", "Hi there", "Good morning", "How are you?"],
  },
  jp: {
    name: "Japan",
    flag: "🇯🇵",
    region: "Asia",
    culturalDos: [
      "Bow when greeting (slight nod is fine)",
      "Remove shoes when entering homes",
      "Use both hands when giving/receiving items",
      "Be punctual and respectful",
      "Speak softly in public spaces",
    ],
    culturalDonts: [
      "Don't point with your finger",
      "Don't blow your nose in public",
      "Don't stick chopsticks upright in rice",
      "Don't wear shoes inside homes",
      "Don't be overly expressive in public",
    ],
    giftingEtiquette: [
      "Present gifts with both hands",
      "Use beautiful wrapping (very important)",
      "Don't open gifts immediately",
      "Avoid sets of 4 (unlucky number)",
      "Include a thoughtful message",
    ],
    commonGreetings: ["こんにちは (Konnichiwa)", "おはよう (Ohayou)", "こんばんは (Konbanwa)"],
  },
  in: {
    name: "India",
    flag: "🇮🇳",
    region: "Asia",
    culturalDos: [
      "Use 'Namaste' with palms together",
      "Remove shoes before entering homes",
      "Use right hand for eating and greeting",
      "Dress modestly, especially in religious places",
      "Show respect to elders",
    ],
    culturalDonts: [
      "Don't use left hand for eating or greeting",
      "Don't show soles of feet to others",
      "Don't touch someone's head",
      "Don't refuse offered food/tea",
      "Don't wear leather in temples",
    ],
    giftingEtiquette: [
      "Offer gifts with both hands",
      "Avoid leather products for religious families",
      "Sweets are always appreciated",
      "Include flowers or garlands",
      "Respect dietary restrictions",
    ],
    commonGreetings: ["Namaste", "Namaskar", "Sat Sri Akal", "Adaab"],
  },
  de: {
    name: "Germany",
    flag: "🇩🇪",
    region: "Europe",
    culturalDos: [
      "Be punctual (arrive exactly on time)",
      "Maintain direct eye contact",
      "Use formal titles until invited to use first names",
      "Be straightforward and honest",
      "Respect quiet hours (10 PM - 6 AM)",
    ],
    culturalDonts: [
      "Don't be late to appointments",
      "Don't make loud noises in public",
      "Don't assume informality",
      "Don't discuss WWII casually",
      "Don't jaywalk",
    ],
    giftingEtiquette: [
      "Bring odd numbers of flowers (not 13)",
      "Unwrap gifts immediately",
      "Quality over quantity",
      "Include a handwritten note",
      "Avoid overly expensive gifts",
    ],
    commonGreetings: ["Guten Tag", "Hallo", "Guten Morgen", "Wie geht's?"],
  },
}

export default function CultureCountryPage() {
  const params = useParams()
  const countryCode = params.country_code as string
  const [holidays, setHolidays] = useState<LocaleHoliday[]>([])
  const [giftSuggestions, setGiftSuggestions] = useState<CulturalGiftSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const countryInfo = COUNTRY_INFO[countryCode.toLowerCase()]

  useEffect(() => {
    loadCountryData()
  }, [countryCode])

  const loadCountryData = async () => {
    try {
      setIsLoading(true)
      const locale = `en-${countryCode.toUpperCase()}`
      const holidayData = await LocaleHolidayService.fetchHolidaysByLocale(locale)
      setHolidays(holidayData)

      // Generate gift suggestions from holidays
      const suggestions: CulturalGiftSuggestion[] = []
      holidayData.forEach((holiday) => {
        const holidaySuggestions = LocaleHolidayService.getCulturalGiftSuggestions(holiday)
        suggestions.push(...holidaySuggestions)
      })

      // Remove duplicates
      const uniqueSuggestions = suggestions.filter(
        (suggestion, index, self) => index === self.findIndex((s) => s.category === suggestion.category),
      )

      setGiftSuggestions(uniqueSuggestions)
    } catch (error) {
      console.error("Error loading country data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!countryInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
          <p className="text-gray-600 mb-4">We don't have cultural information for this country yet.</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{countryInfo.flag}</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {countryInfo.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Cultural Guide & Gift Traditions</p>
          <Badge variant="secondary" className="mt-2">
            <Globe className="w-4 h-4 mr-1" />
            {countryInfo.region}
          </Badge>
        </div>

        {/* Upcoming Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Upcoming Holidays & Celebrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {holidays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {holidays.slice(0, 6).map((holiday) => (
                  <div key={holiday.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{holiday.name}</h3>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {LocaleHolidayService.getHolidayXPBonus(holiday)}x XP
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(holiday.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm mb-3">{holiday.cultural_significance}</p>
                    <div className="flex flex-wrap gap-1">
                      {holiday.gift_traditions.slice(0, 3).map((tradition) => (
                        <Badge key={tradition} variant="outline" className="text-xs">
                          {tradition.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No upcoming holidays found. Check back later for updates!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Traditional Gift Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Traditional Gift Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {giftSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{suggestion.category}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.cultural_context}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Price Range:</span>
                      <Badge variant="outline">{suggestion.price_range}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Appropriateness:</span>
                      <Badge
                        className={
                          suggestion.appropriateness_level === "high"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : suggestion.appropriateness_level === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }
                      >
                        {suggestion.appropriateness_level}
                      </Badge>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {suggestion.items.slice(0, 3).map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Do's and Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Cultural Do's
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {countryInfo.culturalDos.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Cultural Don'ts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {countryInfo.culturalDonts.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Gift-Giving Etiquette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Gift-Giving Etiquette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Best Practices</h3>
                <ul className="space-y-2">
                  {countryInfo.giftingEtiquette.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Common Greetings</h3>
                <div className="space-y-2">
                  {countryInfo.commonGreetings.map((greeting, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {greeting}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Give Culturally-Aware Gifts?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Use our AI-powered gift recommendations that respect {countryInfo.name}'s traditions and customs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/features/gift-gut-check">Start Gift Discovery</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
