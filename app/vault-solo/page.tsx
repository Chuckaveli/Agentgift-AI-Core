"use client"

import { VaultSoloPanel } from "@/components/vault/vault-solo-panel"
import { VaultGiftBidPanel } from "@/components/vault/vault-gift-bid-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Trophy, Zap, Crown } from "lucide-react"

export default function VaultSoloPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AgentVault™
              </h1>
              <p className="text-muted-foreground">Solo Operations Center</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert AGT tokens to VibeCoins or compete in exclusive gift auctions with Zyxen's voice guidance
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="convert" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="convert" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Token Conversion
            </TabsTrigger>
            <TabsTrigger value="bidding" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Gift Bidding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="convert" className="mt-8">
            <VaultSoloPanel />
          </TabsContent>

          <TabsContent value="bidding" className="mt-8">
            <VaultGiftBidPanel />
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                <Coins className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">Token Conversion</CardTitle>
              <CardDescription>Convert AGT tokens to VibeCoins at optimal rates</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Competitive Bidding</CardTitle>
              <CardDescription>Bid on exclusive gifts across different tiers</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Zyxen Integration</CardTitle>
              <CardDescription>AI voice responses and tier-based animations</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
