"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Heart, Users, Zap, Star, ArrowRight, CheckCircle, Globe, Brain, Target } from "lucide-react"
import HeroGiftAnimation from "@/components/animations/hero-gift-animation"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description:
        "Get personalized gift suggestions based on recipient preferences, personality, and cultural background.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Cultural Intelligence",
      description: "Navigate gift-giving customs across different cultures with our comprehensive cultural database.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Our advanced algorithms match gifts to personalities, occasions, and relationship dynamics.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Understand the emotional impact of your gifts with our sentiment analysis technology.",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: Users,
      title: "Group Gifting",
      description: "Coordinate group gifts seamlessly with shared wishlists and contribution tracking.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Sparkles,
      title: "Gift DNA Analysis",
      description: "Decode gift preferences with our proprietary Gift DNA technology for perfect matches.",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      content:
        "AgentGift.ai helped me find the perfect gifts for my international team. The cultural insights are invaluable!",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Father of 3",
      content:
        "Finally, a gift platform that understands my family's unique dynamics. The AI recommendations are spot-on.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Event Planner",
      content:
        "The group gifting feature has revolutionized how I coordinate client appreciation gifts. Absolutely brilliant!",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div
              className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI-Powered Gift Intelligence
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Transform Your
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                    Gifting Experience
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg">
                  Discover perfect gifts with AI-powered recommendations, cultural intelligence, and personalized
                  insights that make every gift meaningful.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Link href="/dashboard">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">50K+</div>
                  <div className="text-sm text-muted-foreground">Perfect Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Animation */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              <HeroGiftAnimation className="w-full h-96 lg:h-[500px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-4 h-4 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Perfect Gifting
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools takes the guesswork out of gift-giving, ensuring every present
              creates lasting memories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Heart className="w-4 h-4 mr-1" />
              Customer Love
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Trusted by Gift-Givers
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`transition-all duration-300 hover:shadow-lg ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-white">Ready to Give the Perfect Gift?</h2>
            <p className="text-xl text-purple-100">
              Join thousands of users who have transformed their gifting experience with AgentGift.ai
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">
                  <Gift className="w-5 h-5 mr-2" />
                  Start Gifting Now
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
