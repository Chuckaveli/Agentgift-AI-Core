"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Sparkles,
  Filter,
  Heart,
  DollarSign,
  Calendar,
  User,
  Loader2,
  ShoppingCart,
  Eye,
  BookmarkPlus,
  Star,
  Gift,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface SearchFilters {
  budget: number[]
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
  rating: number
  reviews: number
  features: string[]
  vendor: string
}

export function SmartSearchForm() {
  const [description, setDescription] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])
  const [selectedGift, setSelectedGift] = useState<GiftSuggestion | null>(null)
  const [savedGifts, setSavedGifts] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    budget: [100],
    occasion: "",
    relationship: "",
    interests: [],
    ageRange: "",
    giftType: "",
  })

  const handleSearch = async () => {
    if (!description.trim()) {
      toast.error("Please describe what you're looking for")
      return
    }

    setIsSearching(true)
    try {
      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      const mockSuggestions: GiftSuggestion[] = [
        {
          id: "1",
          title: "Artisan Coffee Subscription",
          description:
            "Premium coffee beans delivered monthly from around the world with detailed tasting notes and brewing guides",
          price: "$29.99/month",
          category: "Food & Beverage",
          matchScore: 95,
          rating: 4.8,
          reviews: 1247,
          vendor: "Bean & Brew Co.",
          features: ["Monthly delivery", "Tasting notes included", "Cancel anytime", "Free shipping"],
          reasons: [
            "Perfect for coffee enthusiasts",
            "Monthly surprise element",
            "High-quality artisan selection",
            "Fits your budget range perfectly",
          ],
        },
        {
          id: "2",
          title: "Smart Plant Care System",
          description:
            "Automated watering and monitoring system for indoor plants with mobile app control and notifications",
          price: "$89.99",
          category: "Home & Garden",
          matchScore: 88,
          rating: 4.6,
          reviews: 892,
          vendor: "GreenTech Solutions",
          features: ["Mobile app control", "Automatic watering", "Plant health monitoring", "Works with 50+ plants"],
          reasons: [
            "Great for plant lovers",
            "Tech-savvy solution",
            "Promotes wellness and mindfulness",
            "Long-lasting practical gift",
          ],
        },
        {
          id: "3",
          title: "Personalized Star Map",
          description: "Custom star map showing the night sky from a special date and location, beautifully framed",
          price: "$39.99",
          category: "Personalized",
          matchScore: 82,
          rating: 4.9,
          reviews: 2156,
          vendor: "Stellar Memories",
          features: [
            "Custom date & location",
            "High-quality print",
            "Multiple frame options",
            "Digital version included",
          ],
          reasons: [
            "Highly personalized and meaningful",
            "Perfect for romantic occasions",
            "Unique keepsake they'll treasure",
            "Beautiful wall art piece",
          ],
        },
        {
          id: "4",
          title: "Gourmet Cooking Class Experience",
          description: "Hands-on cooking class with professional chef, includes meal, recipes, and wine pairing",
          price: "$125.00",
          category: "Experience",
          matchScore: 79,
          rating: 4.7,
          reviews: 634,
          vendor: "Culinary Adventures",
          features: [
            "Professional chef instruction",
            "All ingredients included",
            "Recipe cards to take home",
            "Wine pairing",
          ],
          reasons: [
            "Interactive and memorable experience",
            "Perfect for food enthusiasts",
            "Creates lasting memories",
            "Can be shared with others",
          ],
        },
      ]

      setSuggestions(mockSuggestions)
      toast.success(`Found ${mockSuggestions.length} personalized gift suggestions!`)
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search for gifts. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectGift = (gift: GiftSuggestion) => {
    toast.success(`Selected "${gift.title}" as your perfect gift!`)
    setIsModalOpen(false)
    // In real app, this would add to cart or start checkout process
    console.log("Selected gift:", gift)
  }

  const handleViewDetails = (gift: GiftSuggestion) => {
    setSelectedGift(gift)
    setIsModalOpen(true)
  }

  const handleSaveGift = (giftId: string, giftTitle: string) => {
    if (savedGifts.includes(giftId)) {
      setSavedGifts((prev) => prev.filter((id) => id !== giftId))
      toast.info(`Removed "${giftTitle}" from saved gifts`)
    } else {
      setSavedGifts((prev) => [...prev, giftId])
      toast.success(`Saved "${giftTitle}" for later!`)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const quickSuggestions = [
    "Birthday gift for coffee-loving friend under $50",
    "Romantic anniversary gift for wife",
    "Apology gift that shows I care",
    "Thank you gift for helpful colleague",
    "Graduation gift for tech-savvy student",
    "Housewarming gift for new neighbors",
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Search Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Gift Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base font-medium">
              Describe what you're looking for
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., 'A thoughtful apology gift for my partner after an argument' or 'Something to celebrate my friend's promotion'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="hidden sm:inline">Be as specific as possible for better results</span>
              <span className="sm:hidden">Be specific for better results</span>
              <span>{description.length}/500</span>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Suggestions</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickSuggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-3 touch-manipulation"
                  onClick={() => setDescription(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Filters */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Refine Your Search
            </Label>

            {/* Budget Slider */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Range: ${filters.budget[0]}
              </Label>
              <div className="px-2 sm:px-3">
                <Slider
                  value={filters.budget}
                  onValueChange={(value) => handleFilterChange("budget", value)}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full touch-manipulation"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$10</span>
                  <span>$500+</span>
                </div>
              </div>
            </div>

            {/* Relationship and Occasion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Relationship
                </Label>
                <Select
                  value={filters.relationship}
                  onValueChange={(value) => handleFilterChange("relationship", value)}
                >
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="romantic_partner">Romantic Partner</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="family_member">Family Member</SelectItem>
                    <SelectItem value="close_friend">Close Friend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="acquaintance">Acquaintance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Occasion
                </Label>
                <Select value={filters.occasion} onValueChange={(value) => handleFilterChange("occasion", value)}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="apology">Apology</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                    <SelectItem value="thank_you">Thank You</SelectItem>
                    <SelectItem value="just_because">Just Because</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="graduation">Graduation</SelectItem>
                    <SelectItem value="housewarming">Housewarming</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gift Type */}
            <div className="space-y-2">
              <Label className="text-sm">Gift Type Preference</Label>
              <Select value={filters.giftType} onValueChange={(value) => handleFilterChange("giftType", value)}>
                <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Gift</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="personalized">Personalized</SelectItem>
                  <SelectItem value="handmade">Handmade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={isSearching || !description.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Finding Perfect Gifts...</span>
                <span className="sm:hidden">Finding Gifts...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Find Gifts with AI</span>
                <span className="sm:hidden">Find Gifts</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold">AI Gift Suggestions</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
              {suggestions.length} matches found
            </Badge>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {suggestions.map((suggestion, index) => (
              <Card key={suggestion.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-base sm:text-lg truncate">{suggestion.title}</h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {suggestion.category}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 text-xs shrink-0">
                          #{index + 1} Best Match
                        </Badge>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 sm:line-clamp-none">
                        {suggestion.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                        <span className="font-semibold text-green-600 text-base sm:text-lg">{suggestion.price}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current" />
                          <span className="font-semibold text-xs sm:text-sm">{suggestion.matchScore}% match</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                          <span className="text-xs sm:text-sm">
                            {suggestion.rating} ({suggestion.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">by {suggestion.vendor}</p>
                    </div>
                  </div>

                  <Separator className="my-3 sm:my-4" />

                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-xs sm:text-sm font-medium">Why this is perfect:</Label>
                    <ul className="space-y-1 sm:space-y-2">
                      {suggestion.reasons.slice(0, 3).map((reason, reasonIndex) => (
                        <li
                          key={reasonIndex}
                          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                      {suggestion.reasons.length > 3 && (
                        <li className="text-xs sm:text-sm text-gray-500 italic">
                          +{suggestion.reasons.length - 3} more reasons...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                      onClick={() => handleSelectGift(suggestion)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Select This Gift</span>
                      <span className="sm:hidden">Select Gift</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                      onClick={() => handleViewDetails(suggestion)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-10 w-10 sm:h-11 sm:w-11 touch-manipulation ${
                        savedGifts.includes(suggestion.id) ? "text-red-500" : ""
                      }`}
                      onClick={() => handleSaveGift(suggestion.id, suggestion.title)}
                    >
                      {savedGifts.includes(suggestion.id) ? (
                        <Heart className="w-4 h-4 fill-current" />
                      ) : (
                        <BookmarkPlus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Actions */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-4 sm:p-6 text-center">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Want more suggestions?</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                Refine your search or try a different description to discover more perfect gifts.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation bg-transparent"
                  onClick={() => {
                    setDescription("")
                    setSuggestions([])
                    setSavedGifts([])
                  }}
                >
                  New Search
                </Button>
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation bg-transparent"
                  onClick={() => {
                    setFilters({
                      budget: [100],
                      occasion: "",
                      relationship: "",
                      interests: [],
                      ageRange: "",
                      giftType: "",
                    })
                  }}
                >
                  Reset Filters
                </Button>
                {savedGifts.length > 0 && (
                  <Button
                    variant="outline"
                    className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation bg-transparent"
                  >
                    <Heart className="w-4 h-4 mr-2 text-red-500 fill-current" />
                    <span className="hidden sm:inline">View Saved ({savedGifts.length})</span>
                    <span className="sm:hidden">Saved ({savedGifts.length})</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gift Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg pr-8">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="truncate">{selectedGift?.title}</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 absolute right-4 top-4 touch-manipulation"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedGift && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {selectedGift.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                  <span className="text-xs sm:text-sm">
                    {selectedGift.rating} ({selectedGift.reviews} reviews)
                  </span>
                </div>
                <span className="font-semibold text-green-600 text-sm sm:text-base">{selectedGift.price}</span>
              </div>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{selectedGift.description}</p>

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Key Features:</h4>
                <ul className="space-y-1">
                  {selectedGift.features.map((feature, idx) => (
                    <li key={idx} className="text-xs sm:text-sm flex items-center gap-2">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Why it's perfect for you:</h4>
                <ul className="space-y-1">
                  {selectedGift.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                      <Heart className="w-3 h-3 text-red-500 fill-current mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                  onClick={() => handleSelectGift(selectedGift)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Select This Gift</span>
                  <span className="sm:hidden">Select Gift</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation bg-transparent"
                  onClick={() => handleSaveGift(selectedGift.id, selectedGift.title)}
                >
                  {savedGifts.includes(selectedGift.id) ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 text-red-500 fill-current" />
                      <span className="hidden sm:inline">Saved</span>
                      <span className="sm:hidden">Saved</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Save for Later</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {suggestions.length === 0 && !isSearching && (
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Ready to Find the Perfect Gift?</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
              Describe what you're looking for and let our AI analyze thousands of gift options to find the most
              thoughtful matches.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
              <Badge variant="secondary" className="text-xs">
                "birthday gift for mom who loves gardening"
              </Badge>
              <Badge variant="secondary" className="text-xs">
                "tech gadget under $100 for teenager"
              </Badge>
              <Badge variant="secondary" className="text-xs">
                "romantic anniversary gift for wife"
              </Badge>
              <Badge variant="secondary" className="text-xs">
                "apology gift that shows I really care"
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

