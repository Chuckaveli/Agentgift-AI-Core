import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Gift, Sparkles, Users, Zap, Heart, Star, Trophy, Target } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section with Lottie Animation */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  🚀 Now Live - AGTE v3.0 Tokenomics
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  Welcome to our platform
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform gift-giving with AI-powered intelligence. Discover perfect gifts, build meaningful
                  connections, and earn rewards through our revolutionary platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 px-8 py-3 bg-transparent"
                >
                  <Link href="/mission" className="flex items-center gap-2">
                    Learn More
                    <Sparkles className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">10K+</div>
                  <div className="text-sm text-gray-500">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">50K+</div>
                  <div className="text-sm text-gray-500">Gifts Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right side - Simple Hero Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md h-96 flex items-center justify-center">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 opacity-50 rounded-3xl" />

                {/* Simple gift icon */}
                <div className="relative z-10 text-8xl">🎁</div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 text-2xl">✨</div>
                <div className="absolute bottom-4 left-4 text-2xl">🌟</div>
                <div className="absolute top-4 left-4 text-xl">🎉</div>
                <div className="absolute bottom-4 right-4 text-xl">🎊</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your gift-giving experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <Card className="h-full border-2 border-purple-100 hover:border-purple-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <CardTitle className="text-xl">Discover</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    Tell us about the recipient and occasion. Our AI analyzes preferences, personality, and context to
                    understand exactly what would make them smile.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="h-full border-2 border-pink-100 hover:border-pink-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <CardTitle className="text-xl">Match</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    Get personalized gift recommendations powered by advanced AI. Each suggestion is tailored to create
                    meaningful connections and memorable moments.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="h-full border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <CardTitle className="text-xl">Celebrate</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    Give the perfect gift and earn AGTE tokens. Build your reputation, unlock premium features, and
                    become part of our gift-giving community.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Process Flow Arrows */}
          <div className="hidden md:flex justify-center items-center mt-8 space-x-8">
            <ArrowRight className="w-8 h-8 text-purple-400" />
            <ArrowRight className="w-8 h-8 text-pink-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powered by AI Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features that make gift-giving effortless and meaningful
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Gift className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered gift suggestions based on personality analysis, preferences, and occasion context.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-pink-600 mb-4" />
                <CardTitle>Group Gifting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coordinate with friends and family for collaborative gifts that create lasting memories.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Instant Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time analysis of trends, preferences, and gift success rates to optimize your choices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Heart className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle>Emotional Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Understand the emotional impact of gifts and create deeper connections through thoughtful giving.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-500 mb-4" />
                <CardTitle>Reward System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn AGTE tokens for successful gifts and unlock premium features as you build your gifting
                  reputation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
                <CardTitle>Premium Features</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access advanced AI companions, priority support, and exclusive gift collections as you level up.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Gift-Giving?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have discovered the joy of perfect gift-giving with AI-powered intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 bg-transparent"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
