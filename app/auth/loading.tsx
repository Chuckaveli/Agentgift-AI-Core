import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Gift, Sparkles } from "lucide-react"

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AgentGift.ai
              </h1>
              <div className="flex items-center justify-center">
                <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                <span className="text-sm text-purple-700">Global</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-8 w-80 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          {/* Demo Preview Skeletons */}
          <div className="flex justify-center space-x-2 py-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <Skeleton className="w-16 h-16 rounded-lg" />
            <Skeleton className="w-16 h-16 rounded-lg" />
          </div>
        </div>

        {/* Auth Card Skeleton */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="text-center">
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Trust Indicators Skeleton */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </div>
    </div>
  )
}
