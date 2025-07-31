import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Shield } from "lucide-react"

export default function EconomyArchitectLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-purple-400 animate-pulse" />
            <h1 className="text-4xl font-bold text-white">Giftverse Economy Architect</h1>
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="text-sm">Voice AI</span>
            </div>
          </div>
          <p className="text-purple-200 text-lg">Initializing intelligent economy management system...</p>

          {/* Loading Economy Health */}
          <div className="flex items-center justify-center gap-6 bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <Skeleton className="h-6 w-24 bg-purple-500/20" />
            <Skeleton className="h-6 w-32 bg-purple-500/20" />
            <Skeleton className="h-6 w-28 bg-purple-500/20" />
            <Skeleton className="h-6 w-30 bg-purple-500/20" />
          </div>
        </div>

        {/* Loading Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm rounded-lg p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 bg-purple-500/20 rounded" />
            ))}
          </div>

          {/* Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-purple-500/20" />
                <Skeleton className="h-4 w-64 bg-purple-500/20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Skeleton className="h-12 w-32 bg-purple-500/20 rounded-lg" />
                  <Skeleton className="h-12 w-32 bg-purple-500/20 rounded-lg" />
                </div>
                <Skeleton className="h-2 w-full bg-purple-500/20" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 bg-purple-500/20 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <Skeleton className="h-6 w-40 bg-purple-500/20" />
                <Skeleton className="h-4 w-56 bg-purple-500/20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-purple-500/20" />
                  <Skeleton className="h-16 w-full bg-purple-500/20 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-purple-500/20" />
                  <Skeleton className="h-20 w-full bg-purple-500/20 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading Economy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 bg-purple-500/20 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20 bg-purple-500/20" />
                      <Skeleton className="h-5 w-16 bg-purple-500/20" />
                      <Skeleton className="h-3 w-24 bg-purple-500/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loading Status */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-purple-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
            <span>Loading economy data and initializing AI voice assistant...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
