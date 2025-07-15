import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Gift, Sparkles, Users, Zap, Heart, Star, Trophy, Target, Globe } from "lucide-react"
import Link from "next/link"
import { HeroGiftAnimation } from "@/components/animations/hero-gift-animation"
import { CulturalLocaleSelector } from "@/components/cultural/cultural-locale-selector"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Cultural Navigation Bar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        {/* 🔒 Spy Mission Alert Login Strip */}
<div className="w-full bg-gradient-to-r from-black via-gray-900 to-black text-green-400 py-3 px-4 text-sm sm:text-base flex justify-between items-center border-b border-green-600 shadow-md tracking-wide">
  <span className="flex items-center gap-2">
    🕵🏽‍♂️ <span className="hidden sm:inline">Access Required:</span> Agent Login Channel
  </span>
  <Link
    href="/login"
    className="bg-green-600 text-black font-bold py-1.5 px-4 rounded hover:bg-green-500 transition-all shadow-green-800 hover:shadow-lg"
  >
    ENTER
  </Link>
</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">AgentGift.ai</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Global
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <CulturalLocaleSelector />
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/mission" className="text-gray-600 hover:text-gray-900">
                  Mission
                </Link>
                <Link href="/cultural-respect" className="text-gray-600 hover:text-gray-900">
                  Cultural Respect
                </Link>
                <Button asChild>
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Lottie Animation */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  🌍 Culturally Intelligent Gift AI
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  Perfect Gifts Across Every Culture
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  The world's most culturally aware AI gift platform. Respects traditions, celebrates diversity, and
                  delivers perfect gifts that resonate across borders, languages, and customs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Start Global Gifting
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 px-8 py-3 bg-transparent"
                >
                  <Link href="/cultural-respect" className="flex items-center gap-2">
                    Our Cultural Promise
                    <Globe className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Global Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-500">Countries Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">25+</div>
                  <div className="text-sm text-gray-500">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-500">Cultural Holidays</div>
                </div>
              </div>
            </div>

            {/* Right side - Lottie Animation */}
            <div className="flex justify-center lg:justify-end">
              <HeroGiftAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Intelligence Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cultural Intelligence at Every Level</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI understands cultural nuances, regional preferences, and local traditions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <Globe className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Regional Awareness</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Adapts gift suggestions based on local customs, holidays, and cultural sensitivities across 50+
                  countries.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <Heart className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle>Emotional Resonance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Matches emotional expression styles - from reserved Nordic tones to expressive Latin warmth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
                <CardTitle>Holiday Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically surfaces regional holidays like Lunar New Year, Diwali, or Ramadan with perfect timing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works Globally</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three culturally intelligent steps to perfect gift-giving
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
                  <CardTitle className="text-xl">Cultural Discovery</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    Our AI analyzes cultural context, regional preferences, and local customs alongside personal
                    preferences to understand what truly resonates.
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
                  <CardTitle className="text-xl">Intelligent Matching</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    Advanced algorithms match personality insights with culturally appropriate gifts, avoiding taboos
                    and celebrating traditions.
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
                  <CardTitle className="text-xl">Global Celebration</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    Deliver culturally resonant gifts with perfect timing, local sourcing options, and respectful
                    presentation that honors traditions.
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powered by Cultural AI Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features that respect diversity and celebrate global traditions
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
                  AI-powered gift suggestions that respect cultural boundaries and celebrate regional preferences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-pink-600 mb-4" />
                <CardTitle>Global Group Gifting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coordinate across time zones and cultures for collaborative gifts that unite diverse communities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Cultural Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time analysis of cultural trends, regional holidays, and local gifting customs worldwide.
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
                  Adapts emotional expression to match cultural communication styles and relationship dynamics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-500 mb-4" />
                <CardTitle>Global Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn AGTE tokens for culturally sensitive gifting and unlock region-specific premium features.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="w-12 h-12 text-green-500 mb-4" />
                <CardTitle>Local Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access curated local artisans, traditional crafts, and region-specific gift collections.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Gift Across Cultures?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join the world's most culturally intelligent gifting platform and connect hearts across borders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                Start Global Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 bg-transparent"
            >
              <Link href="/cultural-respect">Our Cultural Promise</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
