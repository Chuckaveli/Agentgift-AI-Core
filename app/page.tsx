import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Globe, Heart, Star, Users, TrendingUp, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium">
              <Globe className="w-4 h-4 mr-2" />
              Culturally Intelligent Gift AI
            </Badge>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Perfect Gifts
              </span>
              <br />
              <span className="text-gray-900">Across</span>{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Every</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Culture
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The world's most culturally aware AI gift platform. Respects traditions, celebrates diversity, and
              delivers perfect gifts that resonate across borders, languages, and customs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link href="/auth/signup">
                  Start Global Gifting
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 bg-transparent"
                asChild
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  50+
                </div>
                <div className="text-sm text-gray-600 font-medium">Countries Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  25+
                </div>
                <div className="text-sm text-gray-600 font-medium">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  1000+
                </div>
                <div className="text-sm text-gray-600 font-medium">Cultural Holidays</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Cultural Intelligence Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Cultural Intelligence at Every Level</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI understands cultural nuances, regional preferences, and local traditions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Regional Awareness */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Regional Awareness</CardTitle>
                  <CardDescription className="text-gray-600">
                    Understands local customs, holidays, and gift-giving traditions across 50+ countries
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Emotional Intelligence */}
              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Emotional Intelligence</CardTitle>
                  <CardDescription className="text-gray-600">
                    Matches gifts to emotional contexts and relationship dynamics with cultural sensitivity
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Respectful Recommendations */}
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Respectful Recommendations</CardTitle>
                  <CardDescription className="text-gray-600">
                    Ensures all suggestions honor cultural values, religious considerations, and social norms
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">AI-Powered Gifting Tools</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From smart search to cultural respect engines, we have everything you need for perfect gifting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Smart Search */}
              <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Smart Search™</CardTitle>
                  <CardDescription className="text-gray-600">
                    AI-powered gift discovery that understands context, culture, and personal preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-700 border-green-200">FREE</Badge>
                </CardContent>
              </Card>

              {/* Agent Gifty */}
              <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Agent Gifty™</CardTitle>
                  <CardDescription className="text-gray-600">
                    Your personal AI gift concierge that learns your style and delivers personalized drops
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">PRO</Badge>
                </CardContent>
              </Card>

              {/* Gift Gut Check */}
              <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Gift Gut Check™</CardTitle>
                  <CardDescription className="text-gray-600">
                    Get instant AI feedback on your gift ideas with cultural appropriateness scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">PRO</Badge>
                </CardContent>
              </Card>

              {/* Group Gifting */}
              <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Group Gifting</CardTitle>
                  <CardDescription className="text-gray-600">
                    Coordinate with friends and family for collaborative gifts across cultures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-pink-100 text-pink-700 border-pink-200">PRO+</Badge>
                </CardContent>
              </Card>

              {/* Emotion Tags */}
              <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Emotion Tag Gifting</CardTitle>
                  <CardDescription className="text-gray-600">
                    Match gifts to emotional contexts with cultural sensitivity and awareness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-pink-100 text-pink-700 border-pink-200">PRO+</Badge>
                </CardContent>
              </Card>

              {/* Cultural Respect Engine */}
              <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Cultural Respect Engine</CardTitle>
                  <CardDescription className="text-gray-600">
                    Advanced AI that ensures all recommendations honor cultural values and traditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">ENTERPRISE</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Transform Your Gifting?</h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Join thousands of users who have discovered the perfect gifts with our culturally intelligent AI platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 bg-transparent"
                asChild
              >
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-12 opacity-80">
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Free to Start</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Culturally Respectful</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">AgentGift.ai</span>
                </div>
                <p className="text-gray-400 text-sm">The world's most culturally aware AI gift platform.</p>
              </div>

              {/* Product */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Product</h3>
                <div className="space-y-2">
                  <Link href="/smart-search" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Smart Search
                  </Link>
                  <Link href="/agent-gifty" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Agent Gifty
                  </Link>
                  <Link href="/gut-check" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Gift Gut Check
                  </Link>
                  <Link href="/pricing" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Pricing
                  </Link>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Company</h3>
                <div className="space-y-2">
                  <Link href="/mission" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Mission
                  </Link>
                  <Link
                    href="/cultural-respect"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cultural Respect
                  </Link>
                  <Link href="/blog" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Blog
                  </Link>
                  <Link href="/contact" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Contact
                  </Link>
                </div>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Legal</h3>
                <div className="space-y-2">
                  <Link href="/terms" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/cookies" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2024 AgentGift.ai. All rights reserved. Made with ❤️ for global gifting.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
