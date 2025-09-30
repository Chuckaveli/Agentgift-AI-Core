import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/agentgift-logo.png" alt="AgentGift.ai" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">AgentGift.ai</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/features"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                About
              </Link>
              <Button asChild variant="outline">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen py-24">
        <div className="container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to <span className="text-primary">AgentGift.ai</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            AI-powered gift recommendations that create meaningful connections and lasting memories.
          </p>
          <div className="mt-12 space-x-4">
            <Button size="lg" asChild>
              <Link href="/smart-search">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
          <div className="relative w-full max-w-md mt-16">
            <Image
              src="/placeholder.svg"
              alt="Placeholder Image"
              className="rounded-lg shadow-md"
              width={500}
              height={300}
              priority
            />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Intelligent Gift Solutions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our AI-powered platform combines personality analysis, cultural intelligence, and advanced algorithms to
            find gifts that truly matter.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                🧠
              </div>
              <CardTitle>AI Gift Intelligence</CardTitle>
              <CardDescription>
                Advanced algorithms analyze personality traits, preferences, and relationships to suggest the most
                meaningful gifts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                🌍
              </div>
              <CardTitle>Cultural Intelligence</CardTitle>
              <CardDescription>
                Respect cultural traditions and preferences with our global gift intelligence that understands diverse
                customs and celebrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                💝
              </div>
              <CardTitle>Personalized Experiences</CardTitle>
              <CardDescription>
                Create unique gift experiences tailored to individual personalities, interests, and special moments in
                their lives.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                📊
              </div>
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Track gift success rates, learn from feedback, and continuously improve recommendations for better
                results.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                🎯
              </div>
              <CardTitle>Occasion Matching</CardTitle>
              <CardDescription>
                Perfect gifts for every occasion - birthdays, holidays, anniversaries, and spontaneous moments of
                appreciation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                🚀
              </div>
              <CardTitle>Instant Delivery</CardTitle>
              <CardDescription>
                Seamless integration with delivery services for last-minute gifts and scheduled surprises that arrive
                right on time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Gift-Giving?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have discovered the joy of giving perfect gifts with AI-powered intelligence and
            cultural awareness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/agentgift-logo.png" alt="AgentGift.ai" width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">AgentGift.ai</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered gift intelligence for meaningful connections.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/features" className="hover:text-gray-900 dark:hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-gray-900 dark:hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/about" className="hover:text-gray-900 dark:hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-gray-900 dark:hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/help" className="hover:text-gray-900 dark:hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 AgentGift.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
