"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Globe, Brain, Users, ArrowRight, Heart, Crown } from "lucide-react"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Gift,
      title: "AI Gift Concierge",
      description: "Get personalized gift recommendations powered by advanced AI",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      href: "/gift-dna",
    },
    {
      icon: Globe,
      title: "Cultural Intelligence",
      description: "Respect cultural traditions and customs in your gifting",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      href: "/cultural-respect",
    },
    {
      icon: Brain,
      title: "Smart Search",
      description: "Find the perfect gift with intelligent search capabilities",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      href: "/smart-search",
    },
    {
      icon: Users,
      title: "Group Gifting",
      description: "Coordinate group gifts and split costs seamlessly",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
      href: "/group-gifting",
    },
  ]

  const stats = [
    { label: "Happy Users", value: "10K+", icon: Heart },
    { label: "Gifts Recommended", value: "50K+", icon: Gift },
    { label: "Cultures Supported", value: "100+", icon: Globe },
    { label: "AI Accuracy", value: "95%", icon: Brain },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Gift Intelligence
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-foreground">Gifting Experience</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover the perfect gift with AI-powered cultural intelligence, personalized recommendations, and
              gamified discovery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/gift-dna">
                  Try Gift DNA
                  <Gift className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of gifting with our comprehensive suite of AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  hoveredFeature === index ? "scale-105" : ""
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={feature.href}>
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Crown className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Revolutionize Your Gifting?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of users who have transformed their gifting experience with AgentGift.ai
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/dashboard">
                Start Your Journey
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
