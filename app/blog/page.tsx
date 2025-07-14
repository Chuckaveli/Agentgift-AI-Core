"use client"

import { useState, useMemo } from "react"
import { Search, Heart, DollarSign, Leaf, Clock, TrendingUp, Eye, Calendar, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  readTime: number
  views: number
  tags: string[]
  thumbnail: string
  featured?: boolean
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Psychology Behind Perfect Gift-Giving",
    excerpt:
      "Discover the science of meaningful gifts and how AI can decode what people really want. From attachment theory to behavioral psychology...",
    author: "Dr. Sarah Chen",
    publishedAt: "2024-01-15",
    readTime: 8,
    views: 2847,
    tags: ["love", "psychology"],
    thumbnail: "/placeholder.svg?height=200&width=300&text=Psychology+of+Gifts",
    featured: true,
  },
  {
    id: "2",
    title: "50 Gifts Under $25 That Don't Suck",
    excerpt:
      "Budget-friendly doesn't mean boring. Our AI curated the most thoughtful gifts that won't break the bank but will definitely break hearts (in the best way).",
    author: "Marcus Rodriguez",
    publishedAt: "2024-01-12",
    readTime: 6,
    views: 4521,
    tags: ["budget", "practical"],
    thumbnail: "/placeholder.svg?height=200&width=300&text=Budget+Gifts",
  },
  {
    id: "3",
    title: "Sustainable Gifting: Love the Planet, Love Your People",
    excerpt:
      "Eco-conscious gifts that show you care about your loved ones AND Mother Earth. From upcycled treasures to zero-waste wonders...",
    author: "Emma Green",
    publishedAt: "2024-01-10",
    readTime: 7,
    views: 1923,
    tags: ["eco", "sustainable"],
    thumbnail: "/placeholder.svg?height=200&width=300&text=Eco+Gifts",
  },
  {
    id: "4",
    title: "Emergency Gifting: When You Forgot (Again)",
    excerpt:
      "We've all been there. It's 11 PM and you just remembered it's your anniversary tomorrow. Here's how to save the day with last-minute magic.",
    author: "Jake Thompson",
    publishedAt: "2024-01-08",
    readTime: 4,
    views: 6789,
    tags: ["last-minute", "emergency"],
    thumbnail: "/placeholder.svg?height=200&width=300&text=Last+Minute+Gifts",
  },
  {
    id: "5",
    title: "Gen Z Gift Guide: What Actually Matters to Us",
    excerpt:
      "Written by Gen Z, for everyone trying to gift Gen Z. Spoiler: It's not what you think. Authenticity over aesthetics, experiences over things.",
    author: "Zoe Martinez",
    publishedAt: "2024-01-05",
    readTime: 5,
    views: 3456,
    tags: ["gen-z", "trends"],
    thumbnail: "/placeholder.svg?height=200&width=300&text=Gen+Z+Gifts",
  },
  {
    id: "6",
    title: "The Art of Regifting (Yes, It's an Art)",
    excerpt:
      "Regifting doesn't have to be shameful. Learn the ethical, thoughtful way to give gifts a second life while spreading more joy.",
    author: "Lisa Park",
    publishedAt: "2024-01-03",
    readTime: 6,
    views: 2134,
    tags: ["practical", "sustainable"],
    thumbnail: "/placeholder.svg?height=200&width=300&text=Regifting+Guide",
  },
]

const tagFilters = [
  { id: "love", label: "Love", icon: Heart, color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { id: "budget", label: "Budget", icon: DollarSign, color: "bg-green-100 text-green-700 hover:bg-green-200" },
  { id: "eco", label: "Eco", icon: Leaf, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  { id: "last-minute", label: "Last-Minute", icon: Clock, color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  {
    id: "psychology",
    label: "Psychology",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  { id: "practical", label: "Practical", icon: TrendingUp, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => post.tags.includes(tag))
      return matchesSearch && matchesTags
    })
  }, [searchQuery, selectedTags])

  const featuredPost = blogPosts.find((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Your Weekly Gift Hack
            </h1>
            <p className="text-gray-600 text-lg">
              Fresh insights, hot takes, and gift wisdom from the AgentGift.ai crew ✨
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search gift wisdom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 border-purple-200 focus:border-purple-400"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {tagFilters.map((tag) => {
                const Icon = tag.icon
                const isSelected = selectedTags.includes(tag.id)
                return (
                  <Button
                    key={tag.id}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                    className={`${tag.color} border-0 transition-all duration-200 ${
                      isSelected ? "ring-2 ring-purple-400 scale-105" : ""
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {tag.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Featured Article */}
        {featuredPost && searchQuery === "" && selectedTags.length === 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">⭐ Featured</Badge>
              <span className="text-sm text-gray-500">Editor's Pick</span>
            </div>

            <Card className="overflow-hidden bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all duration-300">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={featuredPost.thumbnail || "/placeholder.svg"}
                    alt={featuredPost.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors cursor-pointer">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredPost.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredPost.views.toLocaleString()} views
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    Read Full Article
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Latest Posts Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchQuery || selectedTags.length > 0 ? "Search Results" : "Latest Gift Intel"}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or removing some filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedTags([])
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.thumbnail || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.readTime} min</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString()}
                      </div>
                      <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700">
                        Read More →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Level Up Your Gifting Game?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of gift-givers who've discovered the secret to meaningful presents
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8">
              Explore Gift Wisdom
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
