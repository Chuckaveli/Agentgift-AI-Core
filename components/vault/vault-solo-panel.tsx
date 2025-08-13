"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Coins,
  Zap,
  Sparkles,
  ArrowRight,
  Wallet,
  TrendingUp,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key",
)

interface UserBalance {
  agt_tokens: number
  vibe_coins: number
  total_agt_used: number
  total_conversions: number
}

// Utility function to trigger Zyxen voice
async function triggerZyxenVoice({
  userId,
  lineSpoken,
  context,
}: {
  userId: string
  lineSpoken: string
  context: string
}) {
  try {
    await fetch("https://hook.us2.make.com/nk29vv9vafumafyhhri52ugld8nf4i0n", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        voice_id: "etYoGZvfOzWen08VcK5h", // Zyxen voice ID
        context,
        line_spoken: lineSpoken,
        log_only: false,
      }),
    })
  } catch (error) {
    console.error("Failed to trigger Zyxen voice:", error)
  }
}

export function VaultSoloPanel() {
  const [agtAmount, setAgtAmount] = useState("")
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [conversionRate] = useState(10) // 1 AGT = 10 VibeCoins

  // Mock user session - replace with actual auth
  const mockUser = {
    id: "user-vault-123",
    email: "user@agentgift.ai",
  }

  useEffect(() => {
    loadUserBalance()
  }, [])

  const loadUserBalance = async () => {
    try {
      setLoading(true)

      // Check if we have real Supabase credentials
      const hasRealCredentials =
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://demo.supabase.co"

      if (!hasRealCredentials) {
        // Use mock data when no real credentials
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockBalance: UserBalance = {
          agt_tokens: 250,
          vibe_coins: 1420,
          total_agt_used: 750,
          total_conversions: 12,
        }

        setUserBalance(mockBalance)
        setLoading(false)
        return
      }

      // Real Supabase call would go here
      // const { data, error } = await supabase
      //   .from('user_balances')
      //   .select('*')
      //   .eq('user_id', mockUser.id)
      //   .single()
    } catch (error) {
      console.error("Failed to load user balance:", error)
      toast.error("Failed to load balance data")
    } finally {
      setLoading(false)
    }
  }

  const handleConversion = async () => {
    if (!agtAmount || Number.parseFloat(agtAmount) <= 0) {
      toast.error("Please enter a valid AGT amount")
      return
    }

    const amount = Number.parseFloat(agtAmount)

    if (!userBalance || amount > userBalance.agt_tokens) {
      toast.error("Insufficient AGT tokens")
      return
    }

    setConverting(true)

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("convert_agt_to_vibecoins", {
        body: { amount },
      })

      if (error) {
        throw error
      }

      // Success! Update UI and trigger voice
      const vibeCoinsEarned = amount * conversionRate

      // Update local balance
      setUserBalance((prev) =>
        prev
          ? {
              ...prev,
              agt_tokens: prev.agt_tokens - amount,
              vibe_coins: prev.vibe_coins + vibeCoinsEarned,
              total_agt_used: prev.total_agt_used + amount,
              total_conversions: prev.total_conversions + 1,
            }
          : null,
      )

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Trigger Zyxen voice
      await triggerZyxenVoice({
        userId: mockUser.id,
        context: "agt_conversion",
        lineSpoken: `Transmuting ${amount} AGT to ${vibeCoinsEarned} VibeCoins… Success.`,
      })

      // Success toast
      toast.success(`🎯 Converted ${amount} AGT → ${vibeCoinsEarned} VibeCoins!`, {
        description: "Zyxen has been notified of your successful conversion",
        duration: 5000,
      })

      // Clear input
      setAgtAmount("")
    } catch (error) {
      console.error("Conversion failed:", error)
      toast.error("Conversion failed. Please try again.")
    } finally {
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-muted-foreground">Loading VaultSolo Panel...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">VaultSolo Panel</h2>
        </div>
        <p className="text-muted-foreground">Convert AGT tokens to VibeCoins</p>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">AGT Tokens</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{userBalance?.agt_tokens || 0}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-blue-500/10" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">VibeCoins</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{userBalance?.vibe_coins || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Panel */}
      <Card className={`transition-all duration-500 ${showSuccess ? "ring-2 ring-green-500 shadow-green-500/20" : ""}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Token Conversion
          </CardTitle>
          <CardDescription>Convert AGT tokens to VibeCoins at a 1:10 ratio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversion Rate Info */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Rate:</strong> 1 AGT = {conversionRate} VibeCoins
            </AlertDescription>
          </Alert>

          {/* Input Field */}
          <div className="space-y-2">
            <Label htmlFor="agt-amount">Enter AGT amount</Label>
            <div className="relative">
              <Input
                id="agt-amount"
                type="number"
                value={agtAmount}
                onChange={(e) => setAgtAmount(e.target.value)}
                placeholder="0"
                min="0"
                max={userBalance?.agt_tokens || 0}
                step="0.1"
                className="pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="outline" className="text-xs">
                  AGT
                </Badge>
              </div>
            </div>
          </div>

          {/* Conversion Preview */}
          {agtAmount && Number.parseFloat(agtAmount) > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>You will receive:</span>
                <span className="font-bold text-purple-600">
                  {(Number.parseFloat(agtAmount) * conversionRate).toLocaleString()} VibeCoins
                </span>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <Button
            onClick={handleConversion}
            disabled={
              converting ||
              !agtAmount ||
              Number.parseFloat(agtAmount) <= 0 ||
              (userBalance ? Number.parseFloat(agtAmount) > userBalance.agt_tokens : false)
            }
            className="w-full relative overflow-hidden"
            size="lg"
          >
            {converting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Success!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Convert to VibeCoins
              </>
            )}

            {/* Success animation overlay */}
            {showSuccess && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 animate-pulse" />
            )}
          </Button>

          {/* Voice Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="w-3 h-3" />
            <span>Zyxen will confirm your conversion</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversion History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total AGT Used</div>
              <div className="font-bold">{userBalance?.total_agt_used || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Conversions</div>
              <div className="font-bold">{userBalance?.total_conversions || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning for insufficient balance */}
      {agtAmount && userBalance && Number.parseFloat(agtAmount) > userBalance.agt_tokens && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Insufficient AGT tokens. You have {userBalance.agt_tokens} AGT available.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
