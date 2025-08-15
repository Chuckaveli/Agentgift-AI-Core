"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { EMOTIONAL_FILTERS } from "@/lib/emotional-filters"

interface ConciergeFilterSuggestion {
  id: string
  title: string
  description: string
  filters: string[]
  searchQuery?: string
  icon: string
  color: string
  popularity: number
}

const CONCIERGE_SUGGESTIONS: ConciergeFilterSuggestion[] = [
  {
    id: "sorry_without_words",
    title: "Sorry Without Saying Sorry",
    description: "Gifts that express apology through thoughtful actions",
    filters: ["apology", "gentle_love", "repair"],
    searchQuery: "thoughtful apology meaningful",
    icon: "🙏",
    color: "from-blue-500 to-cyan-500",
    popularity: 95,
  },
  {
    id: "happy_tears",
    title: "Make Her Cry Happy Tears",
    description: "Deeply emotional gifts that touch the heart",
    filters: ["deep_love", "i_see_you", "emotional"],
    searchQuery: "emotional meaningful touching",
    icon: "😭",
    color: "from-pink-500 to-rose-500",
    popularity: 88,
  },
  {
    id: "playful_surprise",
    title: "Playful Surprise Attack",
    description: "Fun, unexpected gifts that bring joy",
    filters: ["surprise", "playful_love", "just_because"],
    searchQuery: "fun surprise playful",
    icon: "🎉",
    color: "from-yellow-500 to-orange-500",
    popularity: 82,
  },
  {
    id: "deep_understanding",
    title: "I Really See You",
    description: "Gifts that show profound understanding",
    filters: ["i_see_you", "deep_love", "reflect"],
    searchQuery: "understanding personal meaningful",
    icon: "👁️",
    color: "from-indigo-600 to-purple-600",
    popularity: 76,
  },
  {
    id: "cozy_comfort",
    title: "Cozy Comfort Vibes",
    description: "Warm, comforting gifts for difficult times",
    filters: ["gentle_love", "repair", "grief"],
    searchQuery: "comfort cozy warm",
    icon: "🤗",
    color: "from-amber-500 to-orange-500",
    popularity: 71,
  },
  {
    id: "celebration_mode",
    title: "Full Celebration Mode",
    description: "Big, bold gifts for major achievements",
    filters: ["celebrate", "pride", "crushed_it"],
    searchQuery: "celebration achievement success",
    icon: "🏆",
    color: "from-green-500 to-emerald-500",
    popularity: 68,
  },
]

interface EnhancedConciergeSuggestionsProps {
  onSuggestionSelect: (suggestion: ConciergeFilterSuggestion) => void
  className?: string
}

export function EnhancedConciergeSuggestions({ onSuggestionSelect, className }: EnhancedConciergeSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  const handleSuggestionClick = (suggestion: ConciergeFilterSuggestion) => {
    setSelectedSuggestion(suggestion.id)
    onSuggestionSelect(suggestion)
  }

  const getFilterNames = (filterIds: string[]): string[] => {
    return filterIds
      .map((id) => {
        const filter = EMOTIONAL_FILTERS.find((f) => f.id === id)
        return filter?.name || id
      })
      .filter(Boolean)
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Search Suggestions</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Let me help you find the perfect emotional match for your gift
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONCIERGE_SUGGESTIONS.map((suggestion) => (
          <Card
            key={suggestion.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
              selectedSuggestion === suggestion.id
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-transparent hover:border-purple-200"
            }`}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${suggestion.color} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}
                  >
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{suggestion.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Sparkles className="w-3 h-3" />
                    {suggestion.popularity}%
                  </div>
                </div>

                {/* Filters Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Filter className="w-3 h-3" />
                    <span>Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getFilterNames(suggestion.filters).map((filterName) => (
                      <Badge key={filterName} variant="secondary" className="text-xs">
                        {filterName}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Search Query Preview */}
                {suggestion.searchQuery && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Search className="w-3 h-3" />
                      <span>Search terms:</span>
                    </div>
                    <p className="text-xs text-gray-500 italic">"{suggestion.searchQuery}"</p>
                  </div>
                )}

                {/* Action */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    className={`w-full bg-gradient-to-r ${suggestion.color} hover:opacity-90 text-white`}
                    asChild
                  >
                    <Link
                      href={`/smart-search?filters=${suggestion.filters.join(",")}&q=${encodeURIComponent(
                        suggestion.searchQuery || "",
                      )}`}
                    >
                      Try This Search
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Search CTA */}
      <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Create Your Own Filter</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
            Mix and match emotions, vibes, and intents to find exactly what you're looking for
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            asChild
          >
            <Link href="/smart-search">
              Open Smart Search
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

