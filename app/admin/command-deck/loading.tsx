import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Command, Brain } from "lucide-react"

export default function CommandDeckLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Command className="h-8 w-8 text-purple-400 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Command Deck AI
            </h1>
          </div>
          <p className="text-gray-300">Initializing AI bot management systems...</p>
        </div>

        {/* Status Overview Loading */}
        <div className="flex items-center justify-center gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 bg-purple-600/20" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Interface Loading */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-purple-600/20" />
              <Skeleton className="h-4 w-64 bg-purple-600/10" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Skeleton className="h-12 w-20 bg-green-600/20" />
                <Skeleton className="h-12 w-20 bg-purple-600/20" />
              </div>
              <Skeleton className="h-2 w-full bg-purple-600/20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-purple-600/10" />
                <Skeleton className="h-20 w-full bg-purple-600/20" />
              </div>
            </CardContent>
          </Card>

          {/* Bot Status Grid Loading */}
          <Card className="lg:col-span-2 bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-purple-600/20" />
              <Skeleton className="h-4 w-48 bg-purple-600/10" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-purple-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded bg-purple-600/20" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24 bg-purple-600/20" />
                          <Skeleton className="h-3 w-16 bg-purple-600/10" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 bg-purple-600/20" />
                    </div>
                    <Skeleton className="h-3 w-full bg-purple-600/10" />
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-7 w-16 bg-purple-600/20" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Command History Loading */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-purple-600/20" />
                <Skeleton className="h-4 w-48 bg-purple-600/10" />
              </div>
              <Skeleton className="h-8 w-16 bg-red-600/20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-purple-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48 bg-purple-600/20" />
                    <Skeleton className="h-4 w-20 bg-purple-600/10" />
                  </div>
                  <Skeleton className="h-8 w-full bg-gray-800/30" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading Animation */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-purple-300">
            <Brain className="h-5 w-5 animate-pulse" />
            <span>Connecting to AI Bot Council...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
