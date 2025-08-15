"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  Brain,
  Zap,
  Send,
  Trophy,
  Crown,
  Star,
  Calendar,
  TrendingUp,
  Search,
  Clock,
  Gift,
  Target,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface TokenType {
  token_name: string
  display_name: string
  emoji: string
  description: string
  color_hex: string
  xp_value: number
}

interface TokenBalance {
  remaining_tokens: number
  total_allocated: number
  emoti_token_types: TokenType
}

interface Transaction {
  id: string
  message: string
  xp_awarded: number
  created_at: string
  emoti_token_types: {
    display_name: string
    emoji: string
  }
  sender?: { email: string }
  receiver?: { email: string }
}

interface LeaderboardEntry {
  user_id: string
  total_received: number
  total_sent: number
  impact_score: number
  rank_position: number
  compassion_received: number
  wisdom_received: number
  energy_received: number
  user_profiles: {
    email: string
    tier: string
  }
}

interface Employee {
  id: string
  email: string
  tier: string
}

const tokenIcons = {
  compassion: Heart,
  wisdom: Brain,
  energy: Zap,
}

const tokenColors = {
  compassion: "text-red-500",
  wisdom: "text-purple-500",
  energy: "text-yellow-500",
}

export default function EmotiTokensPage() {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [sentTokens, setSentTokens] = useState<Transaction[]>([])
  const [receivedTokens, setReceivedTokens] = useState<Transaction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [daysUntilReset, setDaysUntilReset] = useState(0)

  // Send token form state
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [message, setMessage] = useState("")
  const [employeeSearch, setEmployeeSearch] = useState("")

  useEffect(() => {
    loadData()
    loadEmployees()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load balance and transactions
      const balanceResponse = await fetch("/api/emotitokens/balance")
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        setBalances(balanceData.balances || [])
        setSentTokens(balanceData.sent_tokens || [])
        setReceivedTokens(balanceData.received_tokens || [])
        setDaysUntilReset(balanceData.days_until_reset || 0)
      }

      // Load leaderboard
      const leaderboardResponse = await fetch("/api/emotitokens/leaderboard")
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json()
        setLeaderboard(leaderboardData.leaderboard || [])
        setStats(leaderboardData.stats || {})
      }
    } catch (error) {
      console.error("Error loading EmotiTokens data:", error)
      toast.error("Failed to load EmotiTokens data")
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch(`/api/emotitokens/employees?search=${employeeSearch}`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error("Error loading employees:", error)
    }
  }

  const sendToken = async () => {
    if (!selectedEmployee || !selectedToken || !message.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    if (message.length < 5 || message.length > 200) {
      toast.error("Message must be between 5 and 200 characters")
      return
    }

    try {
      setSending(true)
      const response = await fetch("/api/emotitokens/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_email: selectedEmployee,
          token_type: selectedToken,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`${data.message} (+${data.xp_awarded} XP awarded!)`)
        setSelectedEmployee("")
        setSelectedToken("")
        setMessage("")
        loadData() // Refresh data
      } else {
        toast.error(data.error || "Failed to send token")
      }
    } catch (error) {
      console.error("Error sending token:", error)
      toast.error("Failed to send token")
    } finally {
      setSending(false)
    }
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (position === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (position === 3) return <Star className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">#{position}</span>
  }

  const getTotalTokensRemaining = () => {
    return balances.reduce((total, balance) => total + balance.remaining_tokens, 0)
  }

  const getTokenProgress = (balance: TokenBalance) => {
    const used = balance.total_allocated - balance.remaining_tokens
    return (used / balance.total_allocated) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading EmotiTokens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          EmotiTokens
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Recognize your teammates with emotional tokens. Share compassion, wisdom, and energy to build a stronger
          workplace culture.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{daysUntilReset} days until monthly reset</span>
        </div>
      </div>

      {/* Token Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((balance) => {
          const IconComponent = tokenIcons[balance.emoti_token_types.token_name as keyof typeof tokenIcons]
          const colorClass = tokenColors[balance.emoti_token_types.token_name as keyof typeof tokenColors]

          return (
            <Card key={balance.emoti_token_types.token_name} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${colorClass}`} />
                    <CardTitle className="text-lg">{balance.emoti_token_types.display_name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {balance.remaining_tokens}/{balance.total_allocated}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{balance.emoti_token_types.description}</p>
                <Progress value={getTokenProgress(balance)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">+{balance.emoti_token_types.xp_value} XP per token</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Token
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Send Token Tab */}
        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Send Emotional Token
              </CardTitle>
              <CardDescription>
                Recognize a teammate's contribution with a meaningful token and message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getTotalTokensRemaining() === 0 ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    You've used all your emotional tokens for the month. More coming soon!
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Teammate</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search by email..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadEmployees()}
                      />
                      <Button variant="outline" size="icon" onClick={loadEmployees}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a teammate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.email}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {employee.email.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{employee.email}</span>
                              <Badge variant="outline" className="text-xs">
                                {employee.tier.replace("_", " ")}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Token Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Choose Token Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {balances.map((balance) => {
                        const IconComponent =
                          tokenIcons[balance.emoti_token_types.token_name as keyof typeof tokenIcons]
                        const colorClass = tokenColors[balance.emoti_token_types.token_name as keyof typeof tokenColors]
                        const isSelected = selectedToken === balance.emoti_token_types.token_name
                        const isDisabled = balance.remaining_tokens === 0

                        return (
                          <Button
                            key={balance.emoti_token_types.token_name}
                            variant={isSelected ? "default" : "outline"}
                            className={`h-auto p-4 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => !isDisabled && setSelectedToken(balance.emoti_token_types.token_name)}
                            disabled={isDisabled}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <IconComponent className={`h-6 w-6 ${colorClass}`} />
                              <span className="font-medium">{balance.emoti_token_types.display_name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {balance.remaining_tokens} left
                              </Badge>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Message</label>
                    <Textarea
                      placeholder="Share why this person deserves recognition..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={200}
                      rows={3}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5-200 characters required</span>
                      <span>{message.length}/200</span>
                    </div>
                  </div>

                  <Button
                    onClick={sendToken}
                    disabled={sending || !selectedEmployee || !selectedToken || !message.trim()}
                    className="w-full"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Token
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sent Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Tokens Sent ({sentTokens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sentTokens.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tokens sent this month</p>
                  ) : (
                    sentTokens.map((token) => (
                      <div key={token.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <span className="text-lg">{token.emoti_token_types.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{token.emoti_token_types.display_name}</span>
                            <span className="text-xs text-muted-foreground">to {token.receiver?.email}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{token.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(token.created_at).toLocaleDateString()}
                            <Sparkles className="h-3 w-3" />+{token.xp_awarded} XP
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Received Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Tokens Received ({receivedTokens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {receivedTokens.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tokens received this month</p>
                  ) : (
                    receivedTokens.map((token) => (
                      <div key={token.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <span className="text-lg">{token.emoti_token_types.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{token.emoti_token_types.display_name}</span>
                            <span className="text-xs text-muted-foreground">from {token.sender?.email}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{token.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(token.created_at).toLocaleDateString()}
                            <Sparkles className="h-3 w-3" />+{token.xp_awarded} XP earned
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Monthly Leaderboard
              </CardTitle>
              <CardDescription>Top performers based on emotional impact score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No leaderboard data available</p>
                ) : (
                  leaderboard.slice(0, 10).map((entry) => (
                    <div key={entry.user_id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank_position)}</div>
                      <Avatar>
                        <AvatarFallback>{entry.user_profiles.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.user_profiles.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.user_profiles.tier.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Impact: {entry.impact_score}</span>
                          <span>Received: {entry.total_received}</span>
                          <span>Sent: {entry.total_sent}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.compassion_received > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ❤️ {entry.compassion_received}
                          </Badge>
                        )}
                        {entry.wisdom_received > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            🧠 {entry.wisdom_received}
                          </Badge>
                        )}
                        {entry.energy_received > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ⚡ {entry.energy_received}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_transactions || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.participation_rate || 0}%</div>
                <p className="text-xs text-muted-foreground">Employees active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.token_breakdown &&
                    Object.entries(stats.token_breakdown).reduce((a, b) =>
                      stats.token_breakdown[a[0]] > stats.token_breakdown[b[0]] ? a : b,
                    )[0]) ||
                    "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Token type</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Days Left</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{daysUntilReset}</div>
                <p className="text-xs text-muted-foreground">Until reset</p>
              </CardContent>
            </Card>
          </div>

          {/* Token Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
              <CardDescription>How tokens are being used this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.token_breakdown &&
                  Object.entries(stats.token_breakdown).map(([tokenType, count]) => {
                    const total = Object.values(stats.token_breakdown).reduce((a: any, b: any) => a + b, 0)
                    const percentage = total > 0 ? ((count as number) / total) * 100 : 0
                    const IconComponent = tokenIcons[tokenType as keyof typeof tokenIcons]
                    const colorClass = tokenColors[tokenType as keyof typeof tokenColors]

                    return (
                      <div key={tokenType} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent className={`h-4 w-4 ${colorClass}`} />}
                            <span className="capitalize font-medium">{tokenType}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

