"use client"

import { useSupabase } from "@/hooks/use-supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, RefreshCw, Zap, Users, Gift, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { supabase, isConnected, error, retry } = useSupabase()

  // Mock data for demonstration
  const mockStats = {
    totalGifts: 1247,
    activeUsers: 892,
    conversionRate: 23.4,
    revenue: 45678,
  }

  const mockRecentActivity = [
    { id: 1, user: "Sarah M.", action: "Generated gift ideas", time: "2 minutes ago" },
    { id: 2, user: "John D.", action: "Completed purchase", time: "5 minutes ago" },
    { id: 3, user: "Emma L.", action: "Shared gift list", time: "8 minutes ago" },
    { id: 4, user: "Mike R.", action: "Used AI Concierge", time: "12 minutes ago" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome to your culturally intelligent gifting platform</p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={retry} className="ml-4 bg-transparent">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              System Configuration
            </CardTitle>
            <CardDescription>Current environment and service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Supabase</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">ElevenLabs</span>
                <Badge variant="secondary">Server-side</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Whisper</span>
                <Badge variant="secondary">Server-side</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Make.com</span>
                <Badge variant="default">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Gifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{mockStats.totalGifts.toLocaleString()}</span>
                <Gift className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{mockStats.activeUsers.toLocaleString()}</span>
                <Users className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-1">+8% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{mockStats.conversionRate}%</span>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-1">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${mockStats.revenue.toLocaleString()}</span>
                <Zap className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-1">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user interactions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{activity.user}</p>
                      <p className="text-gray-600 text-xs">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Gift className="w-6 h-6 text-purple-600" />
                <span className="font-medium">View All Features</span>
                <span className="text-xs text-gray-500">Manage platform features</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Users className="w-6 h-6 text-pink-600" />
                <span className="font-medium">User Management</span>
                <span className="text-xs text-gray-500">Manage user accounts</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <span className="font-medium">Analytics</span>
                <span className="text-xs text-gray-500">View detailed reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
