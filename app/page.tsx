import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/Navbar"
import { Gift, Brain, Globe, Sparkles, Users, Heart, Star, ArrowRight, Zap } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Advanced algorithms analyze preferences, occasions, and relationships to suggest perfect gifts.",
    badge: "Smart",
  },
  {
    icon: Globe,
    title: "Cultural Intelligence",
    description: "Culturally appropriate gift suggestions that respect traditions and customs worldwide.",
    badge: "Global",
  },
  {
    icon: Sparkles,
    title: "Serendipity Engine",
    description: "Discover unexpected and delightful gift ideas that create memorable moments.",
    badge: "Surprise",
  },
  {
    icon: Users,
    title: "Group Gifting",
    description: "Coordinate with friends and family for collaborative gift-giving experiences.",
    badge: "Social",
  },
  {
    icon: Heart,
    title: "Emotional Intelligence",
    description: "Understand the emotional context behind gift-giving for more meaningful connections.",
    badge: "Empathy",
  },
  {
    icon: Star,
    title: "Premium Curation",
    description: "Hand-picked, high-quality gifts from trusted brands and artisans.",
    badge: "Quality",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    content:
      "AgentGift.ai helped me find the perfect gift for my colleague's promotion. The cultural intelligence feature was amazing!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Father of 3",
    content:
      "Finally, a platform that understands what my kids actually want. The AI recommendations are spot-on every time.",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "Event Planner",
    content: "The group gifting feature saved me hours of coordination. My clients love the personalized touch.",
    rating: 5,
  },
]

const stats = [
  { label: "Happy Customers", value: "50K+" },
  { label: "Perfect Matches", value: "95%" },
  { label: "Countries Served", value: "120+" },
  { label: "Gift Categories", value: "500+" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container-responsive">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              AI-Powered Gift Discovery
            </Badge>
            <h1 className="heading-responsive mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Find the Perfect Gift with AI Intelligence
            </h1>
            <p className="text-responsive mb-8 text-muted-foreground max-w-2xl mx-auto">
              Discover meaningful gifts that create lasting memories. Our AI understands relationships, occasions, and
              cultural nuances to recommend gifts that truly matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Intelligent Gift Discovery</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI platform combines machine learning, cultural intelligence, and emotional understanding to
              revolutionize gift-giving.
            </p>
          </div>

          <div className="grid-responsive">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to discover the perfect gift
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tell Us About Them</h3>
              <p className="text-muted-foreground">
                Share details about the recipient, occasion, and your relationship
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes preferences, cultural context, and emotional significance
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Perfect Matches</h3>
              <p className="text-muted-foreground">Receive personalized recommendations with detailed explanations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers who've found the perfect gifts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-responsive text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Find the Perfect Gift?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who've discovered the joy of AI-powered gift giving. Start your free trial today and
            never give a disappointing gift again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container-responsive">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">AgentGift.ai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered gift discovery platform that helps you find meaningful gifts for every occasion.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/legal/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/data-deletion" className="hover:text-foreground">
                    Data Deletion
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AgentGift.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
