"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Heart, Globe, Users, Zap, ArrowRight, Brain, Target, Lightbulb } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced AI that understands emotions, relationships, and personal preferences",
    },
    {
      icon: Globe,
      title: "Cultural Awareness",
      description: "Respects cultural contexts and traditions from around the world",
    },
    {
      icon: Heart,
      title: "Emotional Understanding",
      description: "Recognizes the emotional significance behind every gift-giving moment",
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Finds the perfect gift based on detailed recipient analysis",
    },
    {
      icon: Lightbulb,
      title: "Creative Suggestions",
      description: "Discovers unique and thoughtful gift ideas you never considered",
    },
    {
      icon: Users,
      title: "Relationship Context",
      description: "Considers your relationship dynamics for appropriate recommendations",
    },
  ]

  const stats = [
    { number: "50+", label: "Countries Supported" },
    { number: "25+", label: "Languages" },
    { number: "1000+", label: "Cultural Holidays" },
    { number: "10K+", label: "Gift Categories" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift.ai
                </h1>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Global Beta
                </Badge>
              </div>
            </div>

            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Perfect Gifts,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Every Time
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered gift recommendations that understand emotions, relationships, and cultural context. Never give
              the wrong gift again.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup?redirect_to=/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                  >
                    Get My Gift Recommendations
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}

              <Link href="/smart-search">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-transparent">
                  Try Smart Search
                  <Zap className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why AgentGift.ai is Different</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI doesn't just suggest random gifts. It understands the deeper context of relationships, emotions,
              and cultural significance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Three simple steps to find the perfect gift</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Tell Us About Them</h3>
              <p className="text-gray-600">Share details about the recipient, your relationship, and the occasion</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-pink-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes emotions, culture, and preferences to understand what matters
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Perfect Recommendations</h3>
              <p className="text-gray-600">
                Get personalized gift suggestions with explanations of why they're perfect
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Give Better Gifts?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who never stress about gift-giving anymore
          </p>

          {user ? (
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup?redirect_to=/dashboard">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                Start Finding Perfect Gifts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
