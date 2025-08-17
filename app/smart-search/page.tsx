"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Sparkles, Gift, Star, Filter, Heart, Globe } from "lucide-react"
import Link from "next/link"
import { EmotionalFilterEngine } from "@/components/filters/emotional-filter-engine"
import { SmartSearchForm } from "@/components/features/smart-search-form"
import type { UserTier } from "@/lib/feature-access"

// Mock user data - in real app this would come from auth/context
const userData = {
  tier: "premium" as UserTier, // Change to test different tiers
  name: "Alex Chen",
}

// Mock gift data
const mockGifts = [
  {
    id: "1",
    title: "Handwritten Letter Kit",
    description: "Beautiful stationery set for heartfelt apologies",
    price: "$24.99",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["apology", "gentle", "thoughtful"],
    rating: 4.8,
    category: "Stationery",
    emotions: ["apology", "gentle_love"],
  },
  {
    id: "2",
    title: "Gourmet Chocolate Box",
    description: "Artisan chocolates that say sorry sweetly",
    price: "$39.99",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["apology", "sweet", "luxury"],
    rating: 4.9,
    category: "Food & Treats",
    emotions: ["apology", "just_because"],
  },
  {
    id: "3",
    title: "Spa Day Experience",
    description: "Relaxing spa treatment for healing and care",
    price: "$129.99",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["repair", "comfort", "luxury"],
    rating: 4.7,
    category: "Experience",
    emotions: ["repair", "gentle_love"],
  },
  {
    id: "4",
    title: "Custom Star Map",
    description: "Capture the night sky of your special moment",
    price: "$49.99",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["deep", "meaningful", "custom"],
    rating: 4.9,
    category: "Personalized",
    emotions: ["deep_love", "i_see_you"],
  },
  {
    id: "5",
    title: "Surprise Picnic Kit",
    description: "Everything needed for a spontaneous outdoor date",
    price: "$79.99",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["surprise", "playful", "experience"],
    rating: 4.6,
    category: "Experience",
    emotions: ["surprise", "playful_love"],
  },
  {
    id: "6",
    title: "Memory Journal",
    description: "Beautiful journal for capturing thoughts and memories",
    price: "$34.99",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["reflect", "thoughtful", "personal"],
    rating: 4.8,
    category: "Stationery",
    emotions: ["reflect", "i_see_you"],
  },
]

export default function SmartSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [filteredGifts, setFilteredGifts] = useState(mockGifts)

  // Memoize the search change handler to prevent infinite re-renders
  const handleSearchChange = useCallback((terms: string[], types: string[], occasions: string[]) => {
    // This function receives search data from the filter engine
    // We can use this data for more advanced filtering if needed
    console.log("Search terms:", terms, "Gift types:", types, "Occasions:", occasions)
  }, [])

  // Memoize the filters change handler
  const handleFiltersChange = useCallback((filters: string[]) => {
    setActiveFilters(filters)
  }, [])

  // Filter gifts based on active filters and search
  useEffect(() => {
    let filtered = mockGifts

    // Filter by emotions
    if (activeFilters.length > 0) {
      filtered = filtered.filter((gift) => gift.emotions.some((emotion) => activeFilters.includes(emotion)))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (gift) =>
          gift.title.toLowerCase().includes(query) ||
          gift.description.toLowerCase().includes(query) ||
          gift.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredGifts(filtered)
  }, [activeFilters, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Search
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find gifts by emotion and intent</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Smart Gift Search</h1>
          <p className="text-muted-foreground">
            Let our AI find the perfect gift based on your description and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4" />
                AI-Powered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes your description to find meaningful gifts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4" />
                Emotional Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Scores gifts based on emotional impact and thoughtfulness</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                Cultural Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Considers cultural context and appropriateness</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4" />
                Smart Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filters by budget, relationship, and occasion automatically
              </p>
            </CardContent>
          </Card>
        </div>

        <SmartSearchForm />

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EmotionalFilterEngine
                userTier={userData.tier}
                onFiltersChange={handleFiltersChange}
                onSearchChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search for gifts... (e.g., 'sorry without saying sorry')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-12 text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Filters Display */}
            {activeFilters.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900 dark:text-white">Active Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filterId) => (
                      <Badge key={filterId} variant="secondary" className="bg-purple-100 text-purple-800">
                        {filterId.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredGifts.length} Gift{filteredGifts.length !== 1 ? "s" : ""} Found
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Emotionally matched</span>
              </div>
            </div>

            {/* Gift Results */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGifts.map((gift) => (
                <Card key={gift.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={gift.image || "/placeholder.svg"}
                      alt={gift.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {gift.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{gift.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-green-600">{gift.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{gift.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {gift.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Gift className="w-4 h-4 mr-2" />
                        Select Gift
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredGifts.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No gifts found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your filters or search terms to find the perfect gift.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters([])
                      setSearchQuery("")
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
