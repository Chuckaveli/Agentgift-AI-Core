import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function UniversalAILoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-[600px] mx-auto" />
      </div>

      {/* Status Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="h-80">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
