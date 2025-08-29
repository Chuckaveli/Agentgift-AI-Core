"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/Navbar"
import { Brain, Search, Users, Sparkles, TrendingUp, Calendar, ArrowRight, Plus } from "lucide-react"

const quickActions = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find gifts using AI-powered search",
    href: "/smart-search",
    color: "bg-blue-500",
  },
  {
    icon: Brain,
    title: "Gift DNA",
    description: "Create personalized gift profiles",
    href: "/gift-dna",
    color: "bg-purple-500",
  },
  {
    icon: Users,
    title: "Group Gifting",
    description: "Coordinate gifts with others",
    href: "/group-gifting",
    color: "bg-green-500",
  },
  {
    icon: Sparkles,
    title: "Serendipity",
    description: "Discover unexpected gift ideas",
    href: "/serendipity",
    color: "bg-orange-500",
  },
]

const recentActivity = [
  {
    type: "search",
    title: "Birthday gift for Sarah",
    time: "2 hours ago",
    status: "completed",
  },
  {
    type: "recommendation",
    title: "Anniversary suggestions",
    time: "1 day ago",
    status: "saved",
  },
  {
    type: "group",
    title: "Wedding gift coordination",
    time: "3 days ago",
    status: "active",
  },
]

const upcomingOccasions = [
  {
    name: "Mom's Birthday",
    date: "Dec 15, 2024",
    daysLeft: 12,
    type: "birthday",
  },
  {
    name: "Anniversary",
    date: "Dec 22, 2024",
    daysLeft: 19,
    type: "anniversary",
  },
  {
    name: "Christmas",
    date: "Dec 25, 2024",
    daysLeft: 22,
    type: "holiday",
  },
]

const trendingGifts = [
  {
    name: "Smart Plant Care System",
    category: "Tech & Gadgets",
    popularity: 95,
    price: "$89",
  },
  {
    name: "Artisan Coffee Subscription",
    category: "Food & Beverage",
    popularity: 88,
    price: "$24/month",
  },
  {
    name: "Personalized Star Map",
    category: "Personalized",
    popularity: 82,
    price: "$45",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Discover perfect gifts with AI-powered recommendations</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                <Link href={action.href}>
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{action.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Occasions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Occasions
                  </CardTitle>
                  <CardDescription>Never miss an important date</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Occasion
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingOccasions.map((occasion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h3 className="font-medium">{occasion.name}</h3>
                        <p className="text-sm text-muted-foreground">{occasion.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={occasion.daysLeft <= 7 ? "destructive" : "secondary"}>
                          {occasion.daysLeft} days
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest gift discoveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant="outline">{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Gifts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Trending Gifts
                </CardTitle>
                <CardDescription>Popular choices this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingGifts.map((gift, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{gift.name}</h4>
                          <p className="text-xs text-muted-foreground">{gift.category}</p>
                        </div>
                        <span className="text-sm font-medium">{gift.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${gift.popularity}%` }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{gift.popularity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Tip:</strong> Based on your search history, consider personalized gifts for upcoming
                      birthdays.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Trend:</strong> Sustainable and eco-friendly gifts are 40% more popular this season.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gifts Found</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Saved Favorites</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold mb-1">Ready to find the perfect gift?</h3>
                <p className="text-muted-foreground">Let our AI help you discover something special</p>
              </div>
              <Button asChild>
                <Link href="/smart-search">
                  Start Searching
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
