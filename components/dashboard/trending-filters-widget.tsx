"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Filter, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTrendingFilters, getWeeklyTrendingFilter } from "@/lib/emotional-filters"

export function TrendingFiltersWidget() {
  const trendingFilters = getTrendingFilters()
  const weeklyTrending = getWeeklyTrendingFilter()

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Trending Emotions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Trending */}
        {weeklyTrending && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{weeklyTrending.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">{weeklyTrending.name}</h4>
                <p className="text-xs text-green-700 dark:text-green-300">{weeklyTrending.description}</p>
              </div>
              <Badge className="bg-green-500 text-white text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            </div>
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
              <Link href={`/smart-search?filters=${weeklyTrending.id}`}>Search "{weeklyTrending.name}" Gifts</Link>
            </Button>
          </div>
        )}

        {/* Other Trending */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Also Trending:</h5>
          {trendingFilters.slice(0, 3).map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{filter.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{filter.name}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                <Link href={`/smart-search?filters=${filter.id}`}>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
            <Link href="/smart-search">
              <Filter className="w-4 h-4 mr-2" />
              Explore All Filters
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

