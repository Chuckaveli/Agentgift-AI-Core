import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LumienceDevLoading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-96 mx-auto bg-gray-800" />
          <Skeleton className="h-6 w-[600px] mx-auto bg-gray-800" />
        </div>

        {/* Privacy Notice Skeleton */}
        <Skeleton className="h-16 w-full bg-gray-800" />

        {/* Main Content Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Feed Skeleton */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="aspect-video w-full bg-gray-800" />
              <Skeleton className="h-10 w-full bg-gray-800" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-32 bg-gray-800" />
              </div>
            </CardContent>
          </Card>

          {/* Current Emotion Skeleton */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <Skeleton className="h-16 w-32 mx-auto bg-gray-800 rounded-full" />
                <Skeleton className="h-2 w-full bg-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 bg-gray-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-28 bg-gray-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emotion History Skeleton */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <Skeleton className="h-6 w-64 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-800" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
