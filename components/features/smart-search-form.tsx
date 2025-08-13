"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Sparkles, Filter, Heart, DollarSign, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface SearchFilters {
  budget: string
  occasion: string
  relationship: string
  interests: string[]
  ageRange: string
  giftType: string
}

interface GiftSuggestion {
  id: string
  title: string
  description: string
  price: string
  category: string
  matchScore: number
  reasons: string[]
  imageUrl?: string
}

export function SmartSearchForm() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    budget: "",
    occasion: "",
    relationship: "",
    interests: [],
    ageRange: "",
    giftType: "",
  })

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setIsSearching(true)
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockSuggestions: GiftSuggestion[] = [
        {
          id: "1",
          title: "Artisan Coffee Subscription",
          description: "Premium coffee beans delivered monthly from around the world",
          price: "$29.99/month",
          category: "Food & Beverage",
          matchScore: 95,
          reasons: ["Matches coffee interest", "Perfect for monthly surprise", "High-quality artisan selection"],
        },
        {
          id: "2",
          title: "Smart Plant Care System",
          description: "Automated watering and monitoring system for indoor plants",
          price: "$89.99",
          category: "Home & Garden",
          matchScore: 88,
          reasons: ["Great for plant lovers", "Tech-savvy solution", "Promotes wellness"],
        },
        {
          id: "3",
          title: "Personalized Star Map",
          description: "Custom star map showing the night sky from a special date and location",
          price: "$39.99",
          category: "Personalized",
          matchScore: 82,
          reasons: ["Highly personalized", "Romantic and meaningful", "Unique keepsake"],
        },
      ]

      setSuggestions(mockSuggestions)
      toast.success(`Found ${mockSuggestions.length} gift suggestions!`)
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search for gifts")
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Smart Gift Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">What kind of gift are you looking for?</Label>
            <div className="flex gap-2">
              <Input
                id="search-query"
                placeholder="e.g., birthday gift for coffee-loving friend under $50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching} className="flex items-center gap-2">
                {isSearching ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Budget
              </Label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.budget}
                onChange={(e) => handleFilterChange("budget", e.target.value)}
              >
                <option value="">Any budget</option>
                <option value="under-25">Under $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="over-100">Over $100</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Occasion
              </Label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.occasion}
                onChange={(e) => handleFilterChange("occasion", e.target.value)}
              >
                <option value="">Any occasion</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="holiday">Holiday</option>
                <option value="graduation">Graduation</option>
                <option value="just-because">Just Because</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <User className="w-3 h-3" />
                Relationship
              </Label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.relationship}
                onChange={(e) => handleFilterChange("relationship", e.target.value)}
              >
                <option value="">Any relationship</option>
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="partner">Partner</option>
                <option value="colleague">Colleague</option>
                <option value="acquaintance">Acquaintance</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Gift Type
              </Label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.giftType}
                onChange={(e) => handleFilterChange("giftType", e.target.value)}
              >
                <option value="">Any type</option>
                <option value="physical">Physical Gift</option>
                <option value="experience">Experience</option>
                <option value="subscription">Subscription</option>
                <option value="digital">Digital</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Gift Suggestions</h3>
            <Badge variant="secondary">{suggestions.length} results</Badge>
          </div>

          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{suggestion.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{suggestion.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                        <span className="font-semibold text-green-600">{suggestion.price}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-sm">{suggestion.matchScore}% match</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Why this is a great match:</Label>
                    <ul className="space-y-1">
                      {suggestion.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Save for Later
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !isSearching && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Find the Perfect Gift?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter a description of what you're looking for and let our AI help you discover amazing gift ideas.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                "birthday gift for mom who loves gardening"
              </Badge>
              <Badge variant="secondary" className="text-xs">
                "tech gadget under $100 for teenager"
              </Badge>
              <Badge variant="secondary" className="text-xs">
                "romantic anniversary gift for wife"
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
