import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Shield, Brain, Zap, Heart, Activity, Users } from "lucide-react"

export default function GiftverseControlLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      {/* Admin Mode Watermark */}
      <div className="fixed top-4 right-4 z-50">
        <Badge variant="destructive" className="animate-pulse">
          <Shield className="w-4 h-4 mr-1" />
          ADMIN MODE ACTIVE
        </Badge>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header Loading */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Voice Interaction Panel Loading */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <Skeleton className="h-6 w-32" />
              <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Loading */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 flex-1" />
            ))}
          </div>

          {/* Dashboard Cards Loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* XP Management Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Credit Management Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <Skeleton className="h-6 w-36" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Badge Assignment Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Loading */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Tables Loading */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters Loading */}
                <div className="flex space-x-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>

                {/* Table Loading */}
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="grid grid-cols-5 gap-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                  {Array.from({ length: 8 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4 border-b last:border-b-0">
                      <div className="grid grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                          <div key={colIndex} className="space-y-2">
                            {colIndex === 0 ? (
                              <>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                              </>
                            ) : colIndex === 1 ? (
                              <div className="flex flex-wrap gap-1">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-12" />
                              </div>
                            ) : colIndex === 2 ? (
                              <div className="flex items-center space-x-2">
                                <Skeleton className="h-2 w-16" />
                                <Skeleton className="h-4 w-8" />
                              </div>
                            ) : (
                              <Skeleton className="h-4 w-20" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Monitor Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-purple-600">
            <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
            <span className="text-sm font-medium">Initializing Giftverse Control Center...</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Agent Galen is preparing the administrative interface</p>
        </div>
      </div>
    </div>
  )
}
