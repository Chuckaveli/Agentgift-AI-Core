import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Brain, Shield } from "lucide-react"

export default function GiftverseLeaderLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-purple-400 animate-pulse" />
            <h1 className="text-4xl font-bold text-white">Giftverse Leader AI Dashboard</h1>
            <div className="bg-purple-600 text-white px-2 py-1 rounded-md flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin Only
            </div>
          </div>
          <p className="text-purple-200 text-lg">Initializing voice-interactive strategic intelligence...</p>
        </div>

        {/* Loading Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 gap-2 bg-black/20 backdrop-blur-sm p-1 rounded-lg">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 bg-purple-600/20" />
            ))}
          </div>

          {/* Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-purple-600/20" />
                <Skeleton className="h-4 w-64 bg-purple-600/10" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Skeleton className="h-12 w-32 bg-purple-600/20" />
                  <Skeleton className="h-12 w-32 bg-purple-600/20" />
                </div>
                <Skeleton className="h-2 w-full bg-purple-600/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-purple-600/10" />
                  <Skeleton className="h-20 w-full bg-purple-600/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-purple-600/20" />
                <Skeleton className="h-4 w-48 bg-purple-600/10" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-purple-600/10" />
                  <Skeleton className="h-16 w-full bg-blue-600/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-purple-600/10" />
                  <Skeleton className="h-16 w-full bg-purple-600/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-black/20 backdrop-blur-sm border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-purple-600/20" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16 bg-purple-600/10" />
                      <Skeleton className="h-5 w-12 bg-purple-600/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loading Animation */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-purple-300">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
            <span>Connecting to Giftverse Mastermind AI...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
