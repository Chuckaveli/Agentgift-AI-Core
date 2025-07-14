import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Heart, Shield, Users, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CulturalRespectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            <Globe className="w-4 h-4 mr-2" />
            Our Cultural Promise
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Respecting Traditions, Celebrating Diversity
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            At AgentGift.ai, we believe that meaningful gift-giving transcends borders while honoring the rich tapestry
            of global cultures. Our AI is trained to respect, understand, and celebrate cultural diversity.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Cultural Principles</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Cultural Sensitivity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our AI actively avoids culturally inappropriate gifts, symbols, or colors that might be offensive or
                  insensitive in different regions and traditions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
              <CardHeader>
                <Heart className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Tradition Celebration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We actively promote and celebrate cultural holidays, traditional crafts, and regional gift-giving
                  customs to help preserve and honor cultural heritage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Inclusive Representation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our platform represents diverse voices, partners with local artisans, and ensures cultural
                  authenticity in every recommendation and interaction.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Ensure Cultural Respect */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How We Ensure Cultural Respect</h2>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Advisory Board</h3>
                <p className="text-gray-600">
                  We work with cultural experts, anthropologists, and local community leaders from around the world to
                  continuously improve our cultural intelligence and sensitivity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Continuous Learning</h3>
                <p className="text-gray-600">
                  Our AI models are regularly updated with new cultural insights, holiday information, and regional
                  preferences to stay current with evolving traditions and customs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Partnerships</h3>
                <p className="text-gray-600">
                  We partner with local artisans, cultural organizations, and gift providers in each region to ensure
                  authentic, respectful, and meaningful gift options.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">User Feedback Integration</h3>
                <p className="text-gray-600">
                  We actively listen to our global community and incorporate feedback to improve cultural accuracy and
                  sensitivity in our recommendations and interactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Cultural Intelligence Features</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                Regional Holiday Intelligence
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Automatic detection of 1000+ cultural holidays worldwide</li>
                <li>• Culturally appropriate gift timing and suggestions</li>
                <li>• Traditional gift-giving customs and etiquette</li>
                <li>• Regional color symbolism and preferences</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-600" />
                Emotional Cultural Adaptation
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Communication style matching (formal vs. casual)</li>
                <li>• Emotional expression adaptation by culture</li>
                <li>• Relationship dynamic understanding</li>
                <li>• Gift-giving occasion appropriateness</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Cultural Taboo Avoidance
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Automatic filtering of culturally inappropriate items</li>
                <li>• Color and symbol sensitivity awareness</li>
                <li>• Religious and cultural dietary restrictions</li>
                <li>• Number and quantity cultural significance</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Local Artisan Support
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Curated collections from local craftspeople</li>
                <li>• Traditional art and craft promotion</li>
                <li>• Fair trade and ethical sourcing priority</li>
                <li>• Cultural heritage preservation support</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Commitment Statement */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Ongoing Commitment</h2>
          <p className="text-xl text-blue-100 mb-8">
            Cultural respect isn't a destination—it's a continuous journey. We're committed to learning, growing, and
            improving our cultural intelligence every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/dashboard">Experience Cultural AI</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/contact">Share Cultural Feedback</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact for Cultural Concerns */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Cultural Concerns or Suggestions?</h3>
          <p className="text-gray-600 mb-6">
            We take cultural sensitivity seriously. If you have concerns, suggestions, or feedback about our cultural
            approach, please reach out to our Cultural Advisory team.
          </p>
          <Button asChild>
            <Link href="/contact?topic=cultural">Contact Cultural Advisory Team</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
