"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  Heart,
  Brain,
  Target,
  Zap,
  Camera,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface FeaturedTool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  href: string
  status: "new" | "locked" | "coming-soon" | "available"
  requiredTier: "free" | "premium" | "pro" | "agent00g"
}

const featuredTools: FeaturedTool[] = [
  {
    id: "agent-gifty",
    name: "Agent Gifty™",
    description: "Personalized gift drops with QR codes",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    href: "/agent-gifty",
    status: "new",
    requiredTier: "pro",
  },
  {
    id: "gift-gut-check",
    name: "Gift Gut Check™",
    description: "AI-powered gift validation",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    href: "/gift-gut-check",
    status: "available",
    requiredTier: "premium",
  },
  {
    id: "emotion-tag-gifting",
    name: "Emotion Tag Gifting",
    description: "Gifts based on emotional analysis",
    icon: Brain,
    color: "from-blue-500 to-purple-500",
    href: "/emotion-gifting",
    status: "new",
    requiredTier: "pro",
  },
  {
    id: "gift-sniper",
    name: "Gift Sniper™",
    description: "Precision gift targeting system",
    icon: Target,
    color: "from-orange-500 to-red-500",
    href: "/gift-sniper",
    status: "coming-soon",
    requiredTier: "agent00g",
  },
  {
    id: "instant-wow",
    name: "Instant Wow Factor",
    description: "Last-minute gift solutions",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    href: "/instant-wow",
    status: "available",
    requiredTier: "free",
  },
  {
    id: "gift-vision",
    name: "Gift Vision AI",
    description: "Photo-based gift recommendations",
    icon: Camera,
    color: "from-green-500 to-blue-500",
    href: "/gift-vision",
    status: "locked",
    requiredTier: "agent00g",
  },
  {
    id: "social-gifting",
    name: "Social Gift Sync",
    description: "Social media integrated gifting",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-500",
    href: "/social-gifting",
    status: "new",
    requiredTier: "premium",
  },
]

// Mock user tier for demo
const userTier = "premium"

const tierHierarchy = {
  free: 0,
  premium: 1,
  pro: 2,
  agent00g: 3,
}

export function FeaturedToolsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const hasAccess = (requiredTier: string) => {
    return (
      tierHierarchy[userTier as keyof typeof tierHierarchy] >= tierHierarchy[requiredTier as keyof typeof tierHierarchy]
    )
  }

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollTo = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280 // Width of one card plus gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updateScrollButtons)
      updateScrollButtons() // Initial check

      return () => scrollContainer.removeEventListener("scroll", updateScrollButtons)
    }
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-green-500 text-white text-xs">New</Badge>
      case "locked":
        return <Badge className="bg-gray-500 text-white text-xs">Locked</Badge>
      case "coming-soon":
        return <Badge className="bg-blue-500 text-white text-xs">Soon</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Tools</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollTo("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollTo("right")}
            disabled={!canScrollRight}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitScrollbar: { display: "none" },
        }}
      >
        {featuredTools.map((tool) => {
          const Icon = tool.icon
          const isLocked = !hasAccess(tool.requiredTier) || tool.status === "locked"
          const isComingSoon = tool.status === "coming-soon"

          return (
            <Card
              key={tool.id}
              className={`relative flex-shrink-0 w-64 transition-all duration-300 group ${
                isLocked || isComingSoon
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:scale-105 hover:shadow-lg cursor-pointer"
              }`}
            >
              <Link href={isLocked || isComingSoon ? "#" : tool.href} className="block">
                {/* Locked/Coming Soon Overlay */}
                {(isLocked || isComingSoon) && (
                  <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      {isComingSoon ? (
                        <>
                          <Zap className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm font-medium">Coming Soon</p>
                        </>
                      ) : (
                        <>
                          <Lock className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm font-medium">Upgrade Required</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-5 group-hover:opacity-10 transition-opacity rounded-lg`}
                />

                <CardContent className="p-6 relative">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {getStatusBadge(tool.status)}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white">{tool.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tool.description}</p>
                    </div>

                    {!isLocked && !isComingSoon && (
                      <div className="flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                        <span>Try Now</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: Math.ceil(featuredTools.length / 2.5) }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / 2.5) === index ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
