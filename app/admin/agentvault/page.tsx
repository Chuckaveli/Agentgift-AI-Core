"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Plus,
  Trophy,
  Calendar,
  Users,
  Coins,
  Activity,
  AlertTriangle,
  CheckCircle,
  Edit,
} from "lucide-react"
import { toast } from "sonner"

export default function AdminAgentVaultPage() {
  const [seasons, setSeasons] = useState([])
  const [rewards, setRewards] = useState([])
  const [eligibility, setEligibility] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Load seasons, rewards, eligibility data
      setLoading(false)
    } catch (error) {
      console.error("Failed to load admin data:", error)
      toast.error("Failed to load admin data")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AgentVault™ Admin...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8" />
            AgentVault™ Admin
          </h1>
          <p className="text-muted-foreground">Manage seasonal auctions and rewards</p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="seasons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="seasons">🗓️ Seasons</TabsTrigger>
          <TabsTrigger value="rewards">🎁 Rewards</TabsTrigger>
          <TabsTrigger value="eligibility">✅ Eligibility</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          <TabsTrigger value="orion">🤖 Agent Orion</TabsTrigger>
        </TabsList>

        <TabsContent value="seasons">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Auction Seasons</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Season
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Failsafe Active:</strong> Maximum 4 seasons per year, 7 days each. Only activate during
                designated windows.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {/* Season management cards would go here */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Winter 2025</CardTitle>
                      <CardDescription>Feb 1-7, 2025</CardDescription>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Status: Awaiting activation</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Auction Rewards</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </Button>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reward Inventory Management</CardTitle>
                  <CardDescription>Configure rewards for upcoming auctions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Reward management interface coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="eligibility">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Company Eligibility</h2>

            <Card>
              <CardHeader>
                <CardTitle>Qualification Requirements</CardTitle>
                <CardDescription>Companies must meet these criteria to access AgentVault™</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Complete Gift Grid 3x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Lead a Gift-Off event</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">100% Sentiment Sync for 60 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Company XP Level ≥ 30</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Additional Criteria:</div>
                    <div className="text-sm text-muted-foreground">
                      • Active EmotiTokens participation
                      <br />• BondCraft™ completion streaks
                      <br />• Culture Cam uploads
                      <br />• Feature usage consistency
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Auction Analytics</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Active Auctions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">VaultCoins Distributed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Eligible Companies</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orion">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Agent Orion - The Archivist Auctioneer</h2>

            <Card>
              <CardHeader>
                <CardTitle>AI Narrator Settings</CardTitle>
                <CardDescription>Configure Agent Orion's auction narration and voice settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Voice Narration</div>
                    <div className="text-sm text-muted-foreground">Enable AI voice for auction events</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Emotional Reactions</div>
                    <div className="text-sm text-muted-foreground">React to rare events and bid intensity</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Narration Style</label>
                  <Select defaultValue="dramatic">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dramatic">Dramatic Auctioneer</SelectItem>
                      <SelectItem value="wise">Wise Archivist</SelectItem>
                      <SelectItem value="playful">Playful Guide</SelectItem>
                      <SelectItem value="professional">Professional Host</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">Sample Orion Narrations:</div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>"A bold move from the shadows! The vault trembles with anticipation..."</p>
                    <p>"The bidding war intensifies! Who will claim this treasure?"</p>
                    <p>"Fascinating... another contender enters the fray!"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

