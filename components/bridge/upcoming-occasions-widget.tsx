"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Gift, Heart, Star } from "lucide-react"
import { useState, useEffect } from "react"

interface Occasion {
  id: string
  name: string
  date: string
  daysAway: number
  type: "birthday" | "holiday" | "anniversary" | "celebration"
  recipient?: string
}

export function UpcomingOccasionsWidget() {
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockOccasions: Occasion[] = [
      {
        id: "1",
        name: "Mom's Birthday",
        date: "Dec 15",
        daysAway: 12,
        type: "birthday",
        recipient: "Mom",
      },
      {
        id: "2",
        name: "Holiday Season",
        date: "Dec 25",
        daysAway: 22,
        type: "holiday",
      },
      {
        id: "3",
        name: "New Year",
        date: "Jan 1",
        daysAway: 29,
        type: "celebration",
      },
      {
        id: "4",
        name: "Anniversary",
        date: "Jan 14",
        daysAway: 42,
        type: "anniversary",
        recipient: "Partner",
      },
    ]

    setTimeout(() => {
      setOccasions(mockOccasions)
      setLoading(false)
    }, 1000)
  }, [])

  const getOccasionIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return Gift
      case "holiday":
        return Star
      case "anniversary":
        return Heart
      default:
        return Calendar
    }
  }

  const getOccasionColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "text-purple-600"
      case "holiday":
        return "text-red-600"
      case "anniversary":
        return "text-pink-600"
      default:
        return "text-blue-600"
    }
  }

  const getUrgencyColor = (daysAway: number) => {
    if (daysAway <= 7) return "bg-red-100 text-red-700 border-red-200"
    if (daysAway <= 14) return "bg-orange-100 text-orange-700 border-orange-200"
    if (daysAway <= 30) return "bg-yellow-100 text-yellow-700 border-yellow-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Upcoming Occasions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Upcoming Occasions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {occasions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No upcoming occasions</p>
            <p className="text-xs text-gray-400">Add some to get gift reminders!</p>
          </div>
        ) : (
          occasions.map((occasion) => {
            const IconComponent = getOccasionIcon(occasion.type)
            return (
              <div
                key={occasion.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white ${getOccasionColor(occasion.type)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{occasion.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600">{occasion.date}</p>
                      {occasion.recipient && (
                        <>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-600">{occasion.recipient}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${getUrgencyColor(occasion.daysAway)}`}>
                  {occasion.daysAway} days
                </Badge>
              </div>
            )
          })
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent hover:bg-purple-50 hover:border-purple-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Occasion
        </Button>
      </CardContent>
    </Card>
  )
}
