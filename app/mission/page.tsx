"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  Heart,
  Brain,
  Sparkles,
  Users,
  Target,
  ArrowRight,
  Star,
  Zap,
  Eye,
  MessageCircle,
  CheckCircle,
  Smile,
  Home,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const aiSteps = [
  {
    id: 1,
    title: "Understanding",
    description: "AI analyzes personality, interests, and relationships",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
    delay: 0,
  },
  {
    id: 2,
    title: "Connecting",
    description: "Finding the perfect match between giver and receiver",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    delay: 1000,
  },
  {
    id: 3,
    title: "Recommending",
    description: "Suggesting gifts that create genuine emotional impact",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    delay: 2000,
  },
  {
    id: 4,
    title: "Celebrating",
    description: "Witnessing the joy of meaningful connections",
    icon: Smile,
    color: "from-yellow-500 to-orange-500",
    delay: 3000,
  },
]

const testimonialMoments = [
  {
    quote: "For the first time, someone truly understood what would make me happy.",
    author: "Sarah, receiving a personalized art kit",
    emotion: "Understood",
  },
  {
    quote: "I never knew my dad collected vintage maps until AI suggested one. His eyes lit up.",
    author: "Michael, surprising his father",
    emotion: "Connected",
  },
  {
    quote: "The book recommendation was so perfect, it felt like magic. Someone really sees me.",
    author: "Elena, birthday surprise",
    emotion: "Seen",
  },
]

export default function MissionPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [visibleTestimonial, setVisibleTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % aiSteps.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setVisibleTestimonial((prev) => (prev + 1) % testimonialMoments.length)
    }, 5000)

    return () => clearInterval(testimonialInterval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link href="/mission" className="text-purple-600 font-medium">
              Our Mission
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
              Pricing
            </Link>
          </nav>

          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-lg px-6 py-2">
              <Heart className="w-5 h-5 mr-2" />
              Our Mission
            </Badge>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-gradient">
                Gifting,
              </span>
              <br />
              <span className="text-gray-800">Reimagined</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We believe every gift should be a bridge between hearts. In a world of endless choices, we use artificial
              intelligence to rediscover the art of meaningful giving.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl" />
            <Image
              src="https://sjc.microlink.io/A_eP-DgaT5FUHAIrnSkFtmXD7jVKMqQsAK8epb87SDFUQMZzYj3d-L8eknzhdoHNmpLYE5q1ybSj-yGbQn72rw.jpeg"
              alt="AI Robot with Gift on Beach"
              width={600}
              height={400}
              className="relative mx-auto rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built on Three{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Foundations
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every great gift starts with understanding, grows through technology, and blooms into meaningful moments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Empathy */}
          <div className="text-center space-y-6 group">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 to-rose-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Deep Empathy</h3>
              <p className="text-gray-600 leading-relaxed">
                We start with the human heart. Our AI doesn't just analyze data—it understands the emotions, memories,
                and relationships that make each person unique. Every recommendation begins with genuine care.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>Sees beyond preferences</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>Understands unspoken needs</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>Honors relationships</span>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="text-center space-y-6 group">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Intelligent Technology</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI processes thousands of signals—personality traits, past preferences, cultural context, and
                timing—to find gifts that resonate on a deeper level. Technology serves emotion, not the other way
                around.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                <span>Lightning-fast insights</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                <span>Precision matching</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Star className="w-4 h-4" />
                <span>Continuously learning</span>
              </div>
            </div>
          </div>

          {/* Meaningful Moments */}
          <div className="text-center space-y-6 group">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Meaningful Moments</h3>
              <p className="text-gray-600 leading-relaxed">
                The magic happens when someone opens a gift and feels truly seen. We measure success not in
                transactions, but in tears of joy, surprised laughter, and the warmth of feeling understood.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Smile className="w-4 h-4" />
                <span>Creates genuine joy</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Heart className="w-4 h-4" />
                <span>Strengthens bonds</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4" />
                <span>Lasting memories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated AI Process Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How AI Helps People{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Feel Seen
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch our AI work its magic, turning data into deep understanding and recommendations into moments of
            connection.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Process Flow */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {aiSteps.map((step, index) => {
              const IconComponent = step.icon
              const isActive = activeStep === index

              return (
                <div
                  key={step.id}
                  className={`text-center space-y-4 transition-all duration-1000 ${
                    isActive ? "scale-110 opacity-100" : "scale-100 opacity-60"
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${
                        isActive ? "shadow-2xl scale-110" : ""
                      }`}
                    >
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-pulse" />
                    )}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-gray-700">{step.id}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>

                  {index < aiSteps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 transform -translate-x-4" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Testimonial Moments */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center space-y-8">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-6 min-h-[120px] flex flex-col justify-center">
                  {testimonialMoments.map((moment, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-1000 ${
                        visibleTestimonial === index
                          ? "opacity-100 transform translate-y-0"
                          : "opacity-0 transform translate-y-4 absolute"
                      }`}
                    >
                      <blockquote className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-4">
                        "{moment.quote}"
                      </blockquote>
                      <div className="flex items-center justify-center space-x-4">
                        <cite className="text-gray-600 not-italic">— {moment.author}</cite>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                          Felt {moment.emotion}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
              The Future of{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Giving</span>
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              We're not just building a product—we're nurturing a world where every gift is a perfect expression of
              love, understanding, and human connection. Where technology amplifies our capacity for empathy, and where
              no one ever has to wonder if they're truly seen.
            </p>

            <div className="text-lg text-gray-500 italic font-medium">"Built by givers, powered by intelligence."</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
            >
              Join Our Mission
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 hover:bg-purple-50 bg-transparent"
              asChild
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </div>
          <p className="text-gray-600">Every gift tells a story. Let's make yours unforgettable.</p>
        </div>
      </footer>
    </div>
  )
}

