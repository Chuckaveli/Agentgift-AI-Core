"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RefreshCw, Database, CheckCircle, AlertCircle, Settings, Zap, Users, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { AGENTGIFT_ASSISTANTS } from "@/lib/assistant-registry"
import { createClient } from "@/lib/supabase-client"
import { env } from "@/lib/env.client"

interface SyncResult {
  success: boolean
  synced_count: number
  error_count: number
  results: Array<{
    assistant_id: string
    name: string
    status: string
    database_id?: string
  }>
  errors: Array<{
    assistant_id: string
    error: string
  }>
  timestamp: string
}

interface AssistantStats {
  total_assistants: number
  active_assistants: number
  by_category: Record<string, number>
  by_type: Record<string, number>
  total_interactions_24h: number
}

export function AssistantSyncPanel() {
  const [syncing, setSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [assistantStats, setAssistantStats] = useState<AssistantStats | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const performSync = async () => {
    try {
      setSyncing(true)
      toast.info("Starting assistant registry sync...")

      // Get current user token
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/admin/sync-assistants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          assistants: AGENTGIFT_ASSISTANTS,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Sync failed")
      }

      setLastSyncResult(result)

      if (result.error_count > 0) {
        toast.warning(`Sync completed with ${result.error_count} errors`)
      } else {
        toast.success(`Successfully synced ${result.synced_count} assistants`)
      }

      // Refresh stats after sync
      await fetchAssistantStats()
    } catch (error) {
      console.error("Sync error:", error)
      toast.error(error instanceof Error ? error.message : "Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  const fetchAssistantStats = async () => {
    try {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch("/api/admin/sync-assistants", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.assistants) {
        const assistants = result.assistants

        // Calculate stats
        const stats: AssistantStats = {
          total_assistants: assistants.length,
          active_assistants: assistants.filter((a: any) => a.is_active).length,
          by_category: {},
          by_type: {},
          total_interactions_24h: assistants.reduce((sum: number, a: any) => sum + (a.interaction_count || 0), 0),
        }

        // Group by category
        assistants.forEach((assistant: any) => {
          const category = assistant.category_tag || "Unknown"
          stats.by_category[category] = (stats.by_category[category] || 0) + 1

          const type = assistant.type || "unknown"
          stats.by_type[type] = (stats.by_type[type] || 0) + 1
        })

        setAssistantStats(stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load stats on component mount
  useState(() => {
    fetchAssistantStats()
  })

  const categoryColors = {
    "Emotional Engine": "bg-pink-100 text-pink-800",
    "Gifting Logic": "bg-purple-100 text-purple-800",
    "Multilingual Voice": "bg-blue-100 text-blue-800",
    "Seasonal Drop": "bg-orange-100 text-orange-800",
    "Internal Bot": "bg-gray-100 text-gray-800",
    "Game Engine": "bg-green-100 text-green-800",
    "XP Controller": "bg-yellow-100 text-yellow-800",
  }

  const typeColors = {
    "user-facing": "bg-emerald-100 text-emerald-800",
    hybrid: "bg-indigo-100 text-indigo-800",
    internal: "bg-slate-100 text-slate-800",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assistant Registry Sync</h2>
          <p className="text-gray-600">Manage and sync AI assistants across the AgentGift Giftverse</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAssistantStats} disabled={loading}>
            <Activity className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh Stats
          </Button>

          <Button
            onClick={performSync}
            disabled={syncing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Registry"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {assistantStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assistants</p>
                  <p className="text-2xl font-bold text-gray-900">{assistantStats.total_assistants}</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assistants</p>
                  <p className="text-2xl font-bold text-green-600">{assistantStats.active_assistants}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">24h Interactions</p>
                  <p className="text-2xl font-bold text-blue-600">{assistantStats.total_interactions_24h}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sync Status</p>
                  <p className="text-2xl font-bold text-orange-600">{lastSyncResult ? "Synced" : "Pending"}</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="sync-results">Sync Results</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {assistantStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assistants by Category</CardTitle>
                  <CardDescription>Distribution across different AI categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(assistantStats.by_category).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(count / assistantStats.total_assistants) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assistants by Type</CardTitle>
                  <CardDescription>User-facing vs internal vs hybrid assistants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(assistantStats.by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
                            {type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${(count / assistantStats.total_assistants) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assistants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configured Assistants</CardTitle>
              <CardDescription>{AGENTGIFT_ASSISTANTS.length} assistants ready for sync</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {AGENTGIFT_ASSISTANTS.map((assistant) => (
                    <motion.div
                      key={assistant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{assistant.linked_to.emoji}</div>
                        <div>
                          <h4 className="font-medium">{assistant.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{assistant.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={categoryColors[assistant.category_tag] || "bg-gray-100 text-gray-800"}>
                          {assistant.category_tag}
                        </Badge>
                        <Badge className={typeColors[assistant.type] || "bg-gray-100 text-gray-800"}>
                          {assistant.type}
                        </Badge>
                        <Badge variant={assistant.is_active ? "default" : "secondary"}>{assistant.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-results" className="space-y-4">
          {lastSyncResult ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Last sync completed at {new Date(lastSyncResult.timestamp).toLocaleString()}
                  <br />
                  Synced: {lastSyncResult.synced_count} | Errors: {lastSyncResult.error_count}
                </AlertDescription>
              </Alert>

              {lastSyncResult.results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sync Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {lastSyncResult.results.map((result) => (
                          <div
                            key={result.assistant_id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div>
                              <span className="font-medium">{result.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({result.assistant_id})</span>
                            </div>
                            <Badge variant="default">{result.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {lastSyncResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Sync Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {lastSyncResult.errors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>{error.assistant_id}:</strong> {error.error}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sync Results</h3>
                <p className="text-gray-600 mb-4">Run a sync to see the results here</p>
                <Button onClick={performSync} disabled={syncing}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                  Start Sync
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>Universal plug-and-play system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Edge Function URL</label>
                  <div className="p-2 bg-gray-100 rounded text-sm font-mono">
                    {env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").split(".")[0]}
                    .functions.supabase.co/sync_assistants
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Authentication</label>
                  <div className="p-2 bg-gray-100 rounded text-sm">Service Role Key (Server-only)</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assistants to Sync</label>
                  <div className="p-2 bg-gray-100 rounded text-sm">
                    {AGENTGIFT_ASSISTANTS.length} pre-configured assistants
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-sync Features</label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      XP Controller Integration
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Voice Engine Compatibility
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Admin Override Support
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Feature Registry Sync
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Reminder:</strong> This sync function uses server-only API keys and bypasses RLS as
                  expected. Only admin users can trigger manual syncs. The system automatically maintains compatibility
                  with XP systems, feature routing, and user tier access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
