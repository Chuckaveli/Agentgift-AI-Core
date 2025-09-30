"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface TestResult {
  success: boolean
  configured: boolean
  tests?: {
    client: { success: boolean; error: string | null }
    admin: { success: boolean; error: string | null }
    auth: { success: boolean; error: string | null; session: boolean }
  }
  environment?: {
    url: string
    anonKey: string
    serviceKey: string
  }
  error?: string
}

export default function SupabaseSetupPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/supabase-test")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (status: string) => {
    const isSet = status.includes("✅")
    return <Badge variant={isSet ? "default" : "destructive"}>{isSet ? "Set" : "Missing"}</Badge>
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supabase Connection Setup</h1>
        <p className="text-muted-foreground">Test and configure your Supabase connection for AgentGift.ai</p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Connection Status
                  {testResult && getStatusIcon(testResult.success)}
                </CardTitle>
                <CardDescription>Overall status of your Supabase connection</CardDescription>
              </div>
              <Button onClick={runTest} disabled={loading} variant="outline" size="sm">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Test Connection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Configuration:</span>
                  <Badge variant={testResult.configured ? "default" : "destructive"}>
                    {testResult.configured ? "Valid" : "Invalid"}
                  </Badge>
                </div>

                {testResult.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{testResult.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Click "Test Connection" to check status</div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables */}
        {testResult?.environment && (
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Status of required Supabase environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
                  {getStatusBadge(testResult.environment.url)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  {getStatusBadge(testResult.environment.anonKey)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">SUPABASE_SERVICE_ROLE_KEY</span>
                  {getStatusBadge(testResult.environment.serviceKey)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Tests */}
        {testResult?.tests && (
          <Card>
            <CardHeader>
              <CardTitle>Connection Tests</CardTitle>
              <CardDescription>Detailed test results for different connection types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Client Connection</div>
                    <div className="text-sm text-muted-foreground">
                      {testResult.tests.client.error || "Standard client connection"}
                    </div>
                  </div>
                  {getStatusIcon(testResult.tests.client.success)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Admin Connection</div>
                    <div className="text-sm text-muted-foreground">
                      {testResult.tests.admin.error || "Service role connection"}
                    </div>
                  </div>
                  {getStatusIcon(testResult.tests.admin.success)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      {testResult.tests.auth.error ||
                        `Auth service (Session: ${testResult.tests.auth.session ? "Active" : "None"})`}
                    </div>
                  </div>
                  {getStatusIcon(testResult.tests.auth.success)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>How to configure your Supabase connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Get your Supabase credentials</h4>
                <p className="text-sm text-muted-foreground">
                  Go to your{" "}
                  <a
                    href="https://app.supabase.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Supabase dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and copy your project URL and API keys.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Set environment variables</h4>
                <p className="text-sm text-muted-foreground">
                  Add these to your <code className="bg-muted px-1 rounded">.env.local</code> file:
                </p>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                  {`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Run the database setup</h4>
                <p className="text-sm text-muted-foreground">
                  Execute the SQL scripts in the <code className="bg-muted px-1 rounded">scripts/</code> folder to set
                  up your database schema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
