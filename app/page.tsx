"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Heart, Star, Gift, Brain, Target, MessageCircle } from "lucide-react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    // Track landing page view
    if (typeof window !== "undefined") {
      console.log("Landing page viewed")
    }
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description: "Our advanced AI analyzes personalities, preferences, and relationships to suggest perfect gifts.",
    },
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Understanding the emotional context behind gift-giving to create meaningful connections.",
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Match gifts to recipients with unprecedented accuracy using our proprietary algorithms.",
    },
    {
      icon: Sparkles,
      title: "Personalized Experience",
      description: "Every recommendation is tailored to your unique relationships and gift-giving style.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      content:
        "AgentGift.ai helped me find the perfect gift for my hard-to-shop-for brother. The AI really understood his personality!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "I used to stress about gift-giving, but now I'm confident every time. The recommendations are spot-on.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Teacher",
      content:
        "The cultural sensitivity feature is amazing. It helped me choose appropriate gifts for my international colleagues.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="mb-8 flex justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentgift-logo-120x120-LNt9JS0WFm3LMER4UKFOXazjdOmyHS.png"
                  alt="AgentGift.ai Mascot"
                  width={120}
                  height={120}
                  className="float-animation"
                />
              </div>

              <Badge variant="secondary" className="mb-6 bg-purple-100 text-purple-700">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Gift Intelligence
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Find the <span className="agentgift-text-gradient">Perfect Gift</span> Every Time
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                Discover personalized gift recommendations powered by advanced AI. Our intelligent system understands
                personalities, relationships, and preferences to suggest gifts that create lasting memories.
              </p>

              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/auth?view=sign_up&redirect=/dashboard">
                  <Button size="lg" className="agentgift-gradient hover:opacity-90 text-white">
                    Get My Gift Recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose AgentGift.ai?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our AI-powered platform combines emotional intelligence with advanced algorithms to revolutionize how you
              give gifts.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className={`transition-all duration-700 delay-${index * 100} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg agentgift-gradient">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Get personalized gift recommendations in three simple steps</p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full agentgift-gradient text-white text-xl font-bold">
                  1
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">Tell Us About Them</h3>
                <p className="mt-2 text-gray-600">
                  Share details about the gift recipient - their personality, interests, and your relationship with
                  them.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full agentgift-gradient text-white text-xl font-bold">
                  2
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">AI Analysis</h3>
                <p className="mt-2 text-gray-600">
                  Our AI processes the information using advanced algorithms and emotional intelligence models.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full agentgift-gradient text-white text-xl font-bold">
                  3
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">Perfect Recommendations</h3>
                <p className="mt-2 text-gray-600">
                  Receive personalized gift suggestions with detailed explanations of why each gift is perfect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Our Users Say</h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of satisfied gift-givers who've discovered the perfect presents
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className={`transition-all duration-700 delay-${index * 200} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <CardHeader>
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-gray-600 mb-4">"{testimonial.content}"</blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 agentgift-gradient">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Give the Perfect Gift?
            </h2>
            <p className="mt-6 text-lg leading-8 text-purple-100">
              Join thousands of users who've discovered the joy of perfect gift-giving. Start your personalized gift
              journey today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth?view=sign_up&redirect=/dashboard">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  Get Started Free
                  <Gift className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
