"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Filter,
  X,
  Lock,
  Crown,
  Sparkles,
  TrendingUp,
  Heart,
  Target,
  Eye,
  ArrowRight,
  Zap,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  EMOTIONAL_FILTERS,
  getAvailableFilters,
  getMaxActiveFilters,
  getTrendingFilters,
  getWeeklyTrendingFilter,
  getFiltersByCategory,
  searchGiftsByFilters,
  FILTER_BUNDLES,
  type EmotionalFilter,
  type FilterBundle,
} from "@/lib/emotional-filters"
import type { UserTier } from "@/lib/feature-access"

interface EmotionalFilterEngineProps {
  userTier: UserTier
  onFiltersChange: (filters: string[]) => void
  onSearchChange: (searchTerms: string[], giftTypes: string[], occasions: string[]) => void
  className?: string
}

export function EmotionalFilterEngine({
  userTier,
  onFiltersChange,
  onSearchChange,
  className,
}: EmotionalFilterEngineProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<FilterBundle | null>(null)
  const [showBundleModal, setShowBundleModal] = useState(false)

  const availableFilters = getAvailableFilters(userTier)
  const maxActiveFilters = getMaxActiveFilters(userTier)
  const trendingFilters = getTrendingFilters()
  const weeklyTrending = getWeeklyTrendingFilter()

  const emotionFilters = getFiltersByCategory("emotion")
  const loveVibeFilters = getFiltersByCategory("love_vibe")
  const intentFilters = getFiltersByCategory("intent")
  const hiddenFilters = getFiltersByCategory("hidden")

  // Update search when filters change
  useEffect(() => {
    const searchData = searchGiftsByFilters(activeFilters)
    onSearchChange(searchData.searchTerms, searchData.giftTypes, searchData.occasions)
    onFiltersChange(activeFilters)
  }, [activeFilters, onFiltersChange, onSearchChange])

  const handleFilterToggle = (filterId: string) => {
    const filter = EMOTIONAL_FILTERS.find((f) => f.id === filterId)
    if (!filter) return

    // Check if user has access to this filter
    if (!availableFilters.some((f) => f.id === filterId)) {
      setShowUpgradeModal(true)
      return
    }

    // Check if filter is already active
    if (activeFilters.includes(filterId)) {
      setActiveFilters((prev) => prev.filter((id) => id !== filterId))
      return
    }

    // Check if user has reached max active filters
    if (activeFilters.length >= maxActiveFilters) {
      toast.error(`You can only have ${maxActiveFilters} active filters. Upgrade for more!`)
      setShowUpgradeModal(true)
      return
    }

    setActiveFilters((prev) => [...prev, filterId])
    toast.success(`Added "${filter.name}" filter`)
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    toast.success("All filters cleared")
  }

  const handleBundlePurchase = (bundle: FilterBundle) => {
    setSelectedBundle(bundle)
    setShowBundleModal(true)
  }

  const isFilterAvailable = (filterId: string) => {
    return availableFilters.some((f) => f.id === filterId)
  }

  const isFilterActive = (filterId: string) => {
    return activeFilters.includes(filterId)
  }

  const FilterChip = ({ filter }: { filter: EmotionalFilter }) => {
    const isAvailable = isFilterAvailable(filter.id)
    const isActive = isFilterActive(filter.id)
    const isLocked = !isAvailable

    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilterToggle(filter.id)}
        className={cn(
          "relative h-auto p-3 flex items-center gap-2 transition-all duration-200",
          isActive && `bg-gradient-to-r ${filter.color} text-white border-transparent hover:opacity-90`,
          isLocked && "opacity-60 cursor-pointer",
          !isActive && !isLocked && "hover:scale-105 hover:shadow-md",
          filter.trending && "ring-2 ring-yellow-400 ring-opacity-50",
          filter.weeklyTrend && "ring-2 ring-green-400 ring-opacity-50",
        )}
        disabled={false} // Allow clicking locked filters to show upgrade modal
      >
        {/* Lock overlay for unavailable filters */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] rounded-md flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-600" />
          </div>
        )}

        <span className="text-lg">{filter.icon}</span>
        <div className="flex flex-col items-start">
          <span className="font-medium text-sm">{filter.name}</span>
          <span className="text-xs opacity-80 text-left">{filter.description}</span>
        </div>

        {/* Trending indicators */}
        {filter.trending && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs bg-yellow-100 text-yellow-800">
            🔥
          </Badge>
        )}
        {filter.weeklyTrend && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs bg-green-100 text-green-800">
            📈
          </Badge>
        )}

        {/* Remove button for active filters */}
        {isActive && (
          <X
            className="w-4 h-4 ml-auto opacity-80 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              handleFilterToggle(filter.id)
            }}
          />
        )}
      </Button>
    )
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-purple-600" />
              Smart Filters
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {activeFilters.length}/{maxActiveFilters}
              </Badge>
            </CardTitle>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-gray-500 hover:text-gray-700">
                Clear All
              </Button>
            )}
          </div>

          {/* Weekly Trending */}
          {weeklyTrending && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-lg">
                    {weeklyTrending.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Trending This Week</h4>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">{weeklyTrending.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleFilterToggle(weeklyTrending.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Try It
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Emotion Tags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-pink-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Emotion Tags</h3>
              <Badge variant="outline" className="text-xs">
                Basic
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionFilters.map((filter) => (
                <FilterChip key={filter.id} filter={filter} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Love Vibes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Love Vibes</h3>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                Premium+
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {loveVibeFilters.map((filter) => (
                <FilterChip key={filter.id} filter={filter} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Intents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Intents</h3>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Pro
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {intentFilters.map((filter) => (
                <FilterChip key={filter.id} filter={filter} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Hidden Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Hidden Depths</h3>
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                Agent 00G
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {hiddenFilters.map((filter) => (
                <FilterChip key={filter.id} filter={filter} />
              ))}
            </div>
          </div>

          {/* Filter Bundles */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Filter Bundles</h3>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Premium Packs
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FILTER_BUNDLES.map((bundle) => (
                <Card
                  key={bundle.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-200"
                  onClick={() => handleBundlePurchase(bundle)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${bundle.color} rounded-full flex items-center justify-center text-lg`}
                      >
                        {bundle.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{bundle.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{bundle.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">${bundle.price}</span>
                          <Badge variant="secondary" className="text-xs">
                            {bundle.filters.length} filters
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Unlock Emotion Tags
            </DialogTitle>
            <DialogDescription>
              Access advanced emotional filters to find the perfect gift for any feeling or situation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                    🧠
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-2">Smart Emotional Search</h3>
                  <p className="text-sm text-purple-700 mb-4">
                    Filter gifts by emotions, love vibes, and hidden depths. Find gifts that say exactly what you feel.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/50 rounded p-2">
                      <span className="font-medium">Free:</span> 2 basic filters
                    </div>
                    <div className="bg-white/50 rounded p-2">
                      <span className="font-medium">Premium:</span> Love vibes
                    </div>
                    <div className="bg-white/50 rounded p-2">
                      <span className="font-medium">Pro:</span> 5 filters + intents
                    </div>
                    <div className="bg-white/50 rounded p-2">
                      <span className="font-medium">Agent 00G:</span> Hidden depths
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bundle Purchase Modal */}
      <Dialog open={showBundleModal} onOpenChange={setShowBundleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              {selectedBundle?.name}
            </DialogTitle>
            <DialogDescription>{selectedBundle?.description}</DialogDescription>
          </DialogHeader>

          {selectedBundle && (
            <div className="space-y-4">
              <Card className={`border-2 bg-gradient-to-r ${selectedBundle.color} bg-opacity-10`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${selectedBundle.color} rounded-full flex items-center justify-center mx-auto mb-3 text-2xl`}
                    >
                      {selectedBundle.icon}
                    </div>
                    <h3 className="font-semibold mb-2">Included Filters:</h3>
                    <div className="space-y-2">
                      {selectedBundle.filters.map((filterId) => {
                        const filter = EMOTIONAL_FILTERS.find((f) => f.id === filterId)
                        return filter ? (
                          <div key={filterId} className="flex items-center gap-2 justify-center">
                            <span>{filter.icon}</span>
                            <span className="text-sm font-medium">{filter.name}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Buy for ${selectedBundle.price}
                </Button>

                <Button variant="outline" onClick={() => setShowBundleModal(false)}>
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
