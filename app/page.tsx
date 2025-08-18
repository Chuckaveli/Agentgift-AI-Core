import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Heart, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">AgentGift.ai</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup?redirect=dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-4 w-4 mr-1" />
            AI-Powered Gift Discovery
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Find the Perfect Gift with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">AI Magic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover personalized gift recommendations powered by advanced AI. Make every occasion special with gifts
            that truly matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?redirect=dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                <Gift className="h-5 w-5 mr-2" />
                Get My Gift Recommendations
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              <Heart className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AgentGift.ai?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes gift-giving effortless and meaningful
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>AI-Powered Recommendations</CardTitle>
                <CardDescription>Advanced algorithms analyze preferences to suggest perfect gifts</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-pink-600 mb-4" />
                <CardTitle>Personalized Experience</CardTitle>
                <CardDescription>Tailored suggestions based on relationships, occasions, and interests</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Social Integration</CardTitle>
                <CardDescription>Connect with friends and family to discover shared gift ideas</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find the Perfect Gift?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who have discovered amazing gifts with our AI
          </p>
          <Link href="/auth/signup?redirect=dashboard">
            <Button size="lg" variant="secondary">
              <Gift className="h-5 w-5 mr-2" />
              Start Your Gift Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Gift className="h-6 w-6" />
              <span className="text-lg font-semibold">AgentGift.ai</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/legal/privacy" className="text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href="/legal/terms" className="text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 AgentGift.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
