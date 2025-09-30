"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface EnvStatus {
  name: string
  isSet: boolean
  isPlaceholder: boolean
  category: string
  required: boolean
}

interface EnvCheckResponse {
  success: boolean
  summary: {
    total: number
    set: number
    missing: number
    placeholders: number
    criticalMissing: number
    optionalMissing: number
  }
  byCategory: Record<string, EnvStatus[]>
  timestamp: string
}

export default function EnvCheckPage() {
  const [data, setData] = useState<EnvCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnvCheck = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/env-check")
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError("Failed to check environment variables")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvCheck()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to load environment check"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Environment Variables Check</h1>
          <p className="text-muted-foreground">Last checked: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        <Button onClick={fetchEnvCheck} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Overall environment variable status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{data.summary.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.summary.set}</div>
              <div className="text-xs text-muted-foreground">Set</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{data.summary.missing}</div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{data.summary.placeholders}</div>
              <div className="text-xs text-muted-foreground">Placeholders</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{data.summary.criticalMissing}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.summary.optionalMissing}</div>
              <div className="text-xs text-muted-foreground">Optional</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {(data.summary.criticalMissing > 0 || data.summary.placeholders > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            {data.summary.criticalMissing > 0 && (
              <p>{data.summary.criticalMissing} critical environment variables are missing.</p>
            )}
            {data.summary.placeholders > 0 && <p>{data.summary.placeholders} variables contain placeholder values.</p>}
            <p className="mt-2">
              Set these in Vercel:{" "}
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">
                Dashboard → Settings → Environment Variables
              </a>
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Variables by Category */}
      {Object.entries(data.byCategory).map(([category, variables]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category}</CardTitle>
            <CardDescription>{variables.length} variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {variables.map((envVar) => (
                <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {envVar.isSet && !envVar.isPlaceholder ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : envVar.isPlaceholder ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-mono text-sm">{envVar.name}</div>
                      {envVar.isPlaceholder && <div className="text-xs text-yellow-600">Placeholder detected</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {envVar.required && <Badge variant="destructive">Required</Badge>}
                    {!envVar.required && <Badge variant="secondary">Optional</Badge>}
                    {envVar.isSet && !envVar.isPlaceholder && (
                      <Badge variant="default" className="bg-green-600">
                        Set
                      </Badge>
                    )}
                    {!envVar.isSet && <Badge variant="destructive">Missing</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
