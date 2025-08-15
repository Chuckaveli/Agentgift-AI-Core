"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Settings,
  Play,
  Users,
  Zap,
  Coins,
  Trophy,
  Gift,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  UserCheck,
} from "lucide-react"

// Mock data for the tokenomics system
const mockFeatureUsage = [
  {
    id: 1,
    userId: "user_123",
    userName: "Sarah Chen",
    userTier: "premium",
    feature: "AI Recommendations",
    xpEarned: 50,
    creditsUsed: 2,
    timestamp: "2024-01-15T10:30:00Z",
    success: true,
  },
  {
    id: 2,
    userId: "user_456",
    userName: "Mike Johnson",
    userTier: "free",
    feature: "Gift Finder Quiz",
    xpEarned: 25,
    creditsUsed: 1,
    timestamp: "2024-01-15T09:15:00Z",
    success: true,
  },
  {
    id: 3,
    userId: "user_789",
    userName: "Emma Wilson",
    userTier: "pro",
    feature: "Voice Concierge",
    xpEarned: 75,
    creditsUsed: 5,
    timestamp: "2024-01-15T08:45:00Z",
    success: false,
  },
  {
    id: 4,
    userId: "user_321",
    userName: "Alex Rodriguez",
    userTier: "premium",
    feature: "Bulk Recommendations",
    xpEarned: 100,
    creditsUsed: 10,
    timestamp: "2024-01-14T16:20:00Z",
    success: true,
  },
  {
    id: 5,
    userId: "user_654",
    userName: "Lisa Park",
    userTier: "free",
    feature: "Basic Search",
    xpEarned: 10,
    creditsUsed: 0,
    timestamp: "2024-01-14T14:10:00Z",
    success: true,
  },
]

const mockTokenomicsConfig = {
  xpToCreditsRatio: 10, // 10 XP = 1 Credit
  tierMultipliers: {
    free: 1.0,
    pro: 1.5,
    premium: 2.0,
  },
  featureCosts: {
    "AI Recommendations": { xp: 50, credits: 2 },
    "Gift Finder Quiz": { xp: 25, credits: 1 },
    "Voice Concierge": { xp: 75, credits: 5 },
    "Bulk Recommendations": { xp: 100, credits: 10 },
    "Basic Search": { xp: 10, credits: 0 },
    "Premium Analytics": { xp: 150, credits: 15 },
  },
  seasonalBonus: {
    enabled: true,
    multiplier: 1.2,
    endDate: "2024-02-14",
  },
}

const mockAnalytics = {
  totalTransactions: 1247,
  totalXPDistributed: 45680,
  totalCreditsUsed: 3421,
  averageSessionXP: 67,
  topFeatures: [
    { name: "AI Recommendations", usage: 45, trend: "up" },
    { name: "Gift Finder Quiz", usage: 32, trend: "up" },
    { name: "Voice Concierge", usage: 18, trend: "down" },
    { name: "Bulk Recommendations", usage: 5, trend: "stable" },
  ],
  tierDistribution: {
    free: 65,
    pro: 25,
    premium: 10,
  },
}

export default function TokenomicsAdminPanel() {
  const [activeView, setActiveView] = useState("overview")
  const [filterBy, setFilterBy] = useState("all")
  const [filterValue, setFilterValue] = useState("")
  const [config, setConfig] = useState(mockTokenomicsConfig)
  const [isEditing, setIsEditing] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState("")
  const [testUserId, setTestUserId] = useState("")

  const filteredUsage = mockFeatureUsage.filter((usage) => {
    if (filterBy === "all") return true
    if (filterBy === "user") return usage.userName.toLowerCase().includes(filterValue.toLowerCase())
    if (filterBy === "feature") return usage.feature.toLowerCase().includes(filterValue.toLowerCase())
    if (filterBy === "tier") return usage.userTier === filterValue
    return true
  })

  const handleConfigSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving config:", config)
    setIsEditing(false)
  }

  const handleFeatureTest = () => {
    if (!selectedFeature || !testUserId) return

    const featureCost = config.featureCosts[selectedFeature]
    console.log(`Testing ${selectedFeature} for user ${testUserId}:`, featureCost)

    // Simulate the transaction
    const newTransaction = {
      id: Date.now(),
      userId: testUserId,
      userName: "Test User",
      userTier: "pro",
      feature: selectedFeature,
      xpEarned: featureCost.xp,
      creditsUsed: featureCost.credits,
      timestamp: new Date().toISOString(),
      success: true,
    }

    console.log("Simulated transaction:", newTransaction)
    setTestDialogOpen(false)
    setSelectedFeature("")
    setTestUserId("")
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 text-gray-800"
      case "pro":
        return "bg-blue-100 text-blue-800"
      case "premium":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AGTE-v2.0 Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AgentGift Tokenomics Engine - Monitor and manage the reward system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Play className="h-4 w-4 mr-2" />
                  Test Feature
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Feature Trigger Tester</DialogTitle>
                  <DialogDescription>Simulate XP earning or credit deduction for any feature</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-user">User ID</Label>
                    <Input
                      id="test-user"
                      placeholder="Enter user ID"
                      value={testUserId}
                      onChange={(e) => setTestUserId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-feature">Feature</Label>
                    <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a feature to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(config.featureCosts).map((feature) => (
                          <SelectItem key={feature} value={feature}>
                            {feature}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedFeature && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Transaction Preview</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>XP Earned:</span>
                          <span className="font-medium text-green-600">
                            +{config.featureCosts[selectedFeature]?.xp} XP
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credits Used:</span>
                          <span className="font-medium text-red-600">
                            -{config.featureCosts[selectedFeature]?.credits} Credits
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFeatureTest} disabled={!selectedFeature || !testUserId}>
                    Run Test
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold">{mockAnalytics.totalTransactions.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">XP Distributed</p>
                  <p className="text-2xl font-bold">{mockAnalytics.totalXPDistributed.toLocaleString()}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Credits Used</p>
                  <p className="text-2xl font-bold">{mockAnalytics.totalCreditsUsed.toLocaleString()}</p>
                </div>
                <Coins className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Session XP</p>
                  <p className="text-2xl font-bold">{mockAnalytics.averageSessionXP}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage-logs">Usage Logs</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Top Features by Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.topFeatures.map((feature, index) => (
                      <div key={feature.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{feature.name}</span>
                          {getTrendIcon(feature.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={feature.usage} className="w-20 h-2" />
                          <span className="text-sm text-gray-600 w-8">{feature.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Tier Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(mockAnalytics.tierDistribution).map(([tier, percentage]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getTierBadgeColor(tier)}>{tier.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seasonal Bonus Status */}
            {config.seasonalBonus.enabled && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <Gift className="h-5 w-5" />
                    Active Seasonal Bonus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {config.seasonalBonus.multiplier}x XP multiplier active until{" "}
                        {new Date(config.seasonalBonus.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Usage Logs Tab */}
          <TabsContent value="usage-logs" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Usage Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="filter-by">Filter By</Label>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Records</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="tier">Tier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {filterBy !== "all" && filterBy !== "tier" && (
                    <div className="flex-1">
                      <Label htmlFor="filter-value">Search Value</Label>
                      <Input
                        id="filter-value"
                        placeholder={`Search by ${filterBy}...`}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                      />
                    </div>
                  )}
                  {filterBy === "tier" && (
                    <div className="flex-1">
                      <Label htmlFor="tier-select">Select Tier</Label>
                      <Select value={filterValue} onValueChange={setFilterValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Table */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Log</CardTitle>
                <CardDescription>
                  Showing {filteredUsage.length} of {mockFeatureUsage.length} records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Feature</TableHead>
                        <TableHead>XP Earned</TableHead>
                        <TableHead>Credits Used</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsage.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="font-medium">{usage.userName}</TableCell>
                          <TableCell>
                            <Badge className={getTierBadgeColor(usage.userTier)}>{usage.userTier.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>{usage.feature}</TableCell>
                          <TableCell className="text-green-600 font-medium">+{usage.xpEarned}</TableCell>
                          <TableCell className="text-red-600 font-medium">-{usage.creditsUsed}</TableCell>
                          <TableCell>
                            <Badge variant={usage.success ? "default" : "destructive"}>
                              {usage.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(usage.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Tokenomics Configuration
                    </CardTitle>
                    <CardDescription>Manage XP-to-Credit ratios and feature costs</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleConfigSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Config
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* XP to Credits Ratio */}
                <div>
                  <Label htmlFor="xp-ratio">XP to Credits Ratio</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="xp-ratio"
                      type="number"
                      value={config.xpToCreditsRatio}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          xpToCreditsRatio: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!isEditing}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">XP = 1 Credit</span>
                  </div>
                </div>

                {/* Tier Multipliers */}
                <div>
                  <Label>Tier Multipliers</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {Object.entries(config.tierMultipliers).map(([tier, multiplier]) => (
                      <div key={tier} className="flex items-center gap-2">
                        <Badge className={getTierBadgeColor(tier)}>{tier.toUpperCase()}</Badge>
                        <Input
                          type="number"
                          step="0.1"
                          value={multiplier}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              tierMultipliers: {
                                ...config.tierMultipliers,
                                [tier]: Number.parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          disabled={!isEditing}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">x</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Costs */}
                <div>
                  <Label>Feature Costs</Label>
                  <div className="space-y-3 mt-2">
                    {Object.entries(config.featureCosts).map(([feature, costs]) => (
                      <div key={feature} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1 font-medium">{feature}</div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">XP:</Label>
                          <Input
                            type="number"
                            value={costs.xp}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                featureCosts: {
                                  ...config.featureCosts,
                                  [feature]: {
                                    ...costs,
                                    xp: Number.parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            disabled={!isEditing}
                            className="w-20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Credits:</Label>
                          <Input
                            type="number"
                            value={costs.credits}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                featureCosts: {
                                  ...config.featureCosts,
                                  [feature]: {
                                    ...costs,
                                    credits: Number.parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            disabled={!isEditing}
                            className="w-20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seasonal Bonus */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Seasonal Bonus</Label>
                    <Switch
                      checked={config.seasonalBonus.enabled}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          seasonalBonus: {
                            ...config.seasonalBonus,
                            enabled: checked,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  {config.seasonalBonus.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Multiplier</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={config.seasonalBonus.multiplier}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              seasonalBonus: {
                                ...config.seasonalBonus,
                                multiplier: Number.parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">End Date</Label>
                        <Input
                          type="date"
                          value={config.seasonalBonus.endDate}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              seasonalBonus: {
                                ...config.seasonalBonus,
                                endDate: e.target.value,
                              },
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plugins Tab */}
          <TabsContent value="plugins" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Badge Unlocks Plugin */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Badge Unlocks
                  </CardTitle>
                  <CardDescription>Automatic badge rewards based on XP milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Configure Plugin
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seasonal Rewards Plugin */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Seasonal Rewards
                  </CardTitle>
                  <CardDescription>Special events and holiday bonus systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Configure Plugin
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Referral System Plugin */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    Referral System
                  </CardTitle>
                  <CardDescription>Reward users for bringing friends to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Configure Plugin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plugin Development</CardTitle>
                <CardDescription>Ready to extend AGTE-v2.0 with custom plugins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Extensible Architecture</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The tokenomics engine is designed to support custom plugins for badges, seasonal rewards, referrals,
                    and more.
                  </p>
                  <Button variant="outline">View Plugin API Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

