"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Shield, Users, Coins, TrendingUp, Star, Award, ExternalLink, Mail, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Terms & Transparency
          </h1>
          <p className="text-gray-600 text-lg">
            Understanding AgentGift.ai's platform rules, tokenomics, and your rights
          </p>
          <Badge variant="outline" className="mt-2">
            Last Updated: January 15, 2025
          </Badge>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="#terms">Terms & Conditions</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#rules">Platform Rules</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#tokenomics">AG Tokenomics</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#future">Future Use</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card className="mb-8" id="terms">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">User Responsibility & Age Requirements</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Users must be 13+ years old to create an account</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• Accurate recipient information is required for optimal results</li>
                <li>• Users must comply with all applicable laws and regulations</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">AI Usage Transparency</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Important Notice</p>
                    <p className="text-amber-700 text-sm mt-1">
                      AI-generated gift suggestions are recommendations only and are not legally binding. AgentGift.ai
                      does not guarantee the suitability or success of any suggested gifts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Intellectual Property</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• AgentGift.ai branding, tools, and algorithms are protected intellectual property</li>
                <li>• Users cannot resell or redistribute AI outputs without written permission</li>
                <li>• Fair use applies to free-tier features with usage limitations</li>
                <li>• User-generated content remains owned by the user</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Service Limitations</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Currently recommendation-only; no physical product sales</li>
                <li>• Service availability may vary by region</li>
                <li>• Features may be modified or discontinued with notice</li>
                <li>• Free tier includes usage limitations and restrictions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Rules */}
        <Card className="mb-8" id="rules">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              AgentGift Core Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">User Guidelines</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">Provide accurate recipient data for personalized results</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">Use features responsibly and within plan limits</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">Respect intellectual property and usage rights</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p className="text-sm">No spamming features or bypassing usage limits</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p className="text-sm">No impersonation of brands or individuals</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p className="text-sm">No reselling AI outputs without permission</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Gamification & Rewards</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> XP, badges, and levels are gamification elements with no monetary value.
                  They unlock platform perks and features but cannot be exchanged for cash or external rewards.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Account Restrictions</h3>
              <p className="text-gray-700 text-sm mb-3">
                Violations may result in temporary restrictions, feature limitations, or account suspension:
              </p>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Misuse of gifting system or AI features</li>
                <li>• Attempting to circumvent usage limits</li>
                <li>• Harassment or inappropriate behavior</li>
                <li>• Violation of intellectual property rights</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AG Tokenomics */}
        <Card className="mb-8" id="tokenomics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              AG Tokenomics Engine v3.0
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Chart */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-center">How Credits & XP Work</h3>

              {/* Flow Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-medium">1 Feature</p>
                    <p className="text-sm text-gray-600">= 1 Credit</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium">2 Credits</p>
                    <p className="text-sm text-gray-600">= 1 XP</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium">150 XP</p>
                    <p className="text-sm text-gray-600">= 1 Level</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Award className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="font-medium">Level 100</p>
                    <p className="text-sm text-gray-600">= Prestige</p>
                  </div>
                </div>
              </div>

              {/* Prestige Rewards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium">Silver Prestige</p>
                  <p className="text-sm text-gray-600">10% Lifetime Discount</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium">Gold Prestige</p>
                  <p className="text-sm text-gray-600">20% Lifetime Discount</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium">Diamond Prestige</p>
                  <p className="text-sm text-gray-600">50% Lifetime Discount*</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                *Diamond Prestige requires continuous subscription
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Credit System Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Monthly Reset</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Credits reset monthly based on your subscription plan. Unused credits do not roll over.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Free Tier:</span>
                      <span className="font-medium">10 credits/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Premium:</span>
                      <span className="font-medium">100 credits/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pro+:</span>
                      <span className="font-medium">500 credits/month</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Bonus XP Sources</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Feature usage (automatic)</li>
                    <li>• Social media participation</li>
                    <li>• Badge unlocks and achievements</li>
                    <li>• Referral activity</li>
                    <li>• Seasonal events and campaigns</li>
                    <li>• Community challenges</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Use Transparency */}
        <Card className="mb-8" id="future">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-indigo-600" />
              Future Use Transparency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Planned Integrations</h3>
              <p className="text-gray-700 mb-4">
                AgentGift.ai may integrate with the following services to provide physical gift experiences:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">Amazon</p>
                  <p className="text-xs text-orange-600">Gift delivery</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-800">DoorDash</p>
                  <p className="text-xs text-red-600">Food experiences</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Expedia</p>
                  <p className="text-xs text-blue-600">Travel gifts</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800">Local Partners</p>
                  <p className="text-xs text-purple-600">Experiences</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Data Privacy Commitment</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="space-y-2 text-green-800 text-sm">
                  <li>• Personal data like mood, emotion tags, and photos will NEVER be sold</li>
                  <li>• All data sharing requires explicit opt-in consent</li>
                  <li>• Users maintain full control over their data</li>
                  <li>• Data is used only to improve your gifting experience</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Future Features</h3>
              <p className="text-gray-700 mb-3">Upcoming features will follow strict opt-in policies:</p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• NFT unlockables and digital collectibles</li>
                <li>• Advanced AI gifting assistants</li>
                <li>• Blockchain-based reward systems</li>
                <li>• Enhanced social media integrations</li>
                <li>• Voice-activated gifting experiences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              For questions about these terms, disputes, or account issues, please contact us:
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/contact">Visit Support Center</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 AgentGift.ai. All rights reserved.</p>
          <p className="mt-1">
            By using our platform, you agree to these terms and our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
