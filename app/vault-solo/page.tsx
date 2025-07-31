"use client"

import { VaultSoloPanel } from "@/components/vault/vault-solo-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Zap, Volume2 } from "lucide-react"

export default function VaultSoloPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">VaultSolo</h1>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            AGT → VibeCoins
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground mb-4">
          Convert your AGT tokens into VibeCoins for AgentVault™ bidding
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="w-4 h-4" />
          <span>Powered by Zyxen Voice AI</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Conversion Panel */}
        <div className="lg:col-span-2">
          <VaultSoloPanel />
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">1</span>
                </div>
                <div>
                  <div className="font-medium">Enter AGT Amount</div>
                  <div className="text-muted-foreground">Specify how many AGT tokens to convert</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
                <div>
                  <div className="font-medium">Instant Conversion</div>
                  <div className="text-muted-foreground">1 AGT = 10 VibeCoins at current rate</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <div className="font-medium">Zyxen Confirmation</div>
                  <div className="text-muted-foreground">Voice AI confirms your successful conversion</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VibeCoins Usage</CardTitle>
              <CardDescription>What you can do with VibeCoins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Bid in AgentVault™ auctions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Purchase premium gift experiences</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Unlock exclusive team rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Access special seasonal events</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-500" />
                Zyxen Voice AI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground mb-3">
                Every successful conversion triggers Zyxen, our specialized vault AI, to confirm your transaction with a
                personalized voice message.
              </p>
              <Badge variant="outline" className="text-xs">
                Voice ID: etYoGZvfOzWen08VcK5h
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
