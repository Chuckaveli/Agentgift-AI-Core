import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssistantHubLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Filters Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>

          {/* Grid Skeleton */}
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, cardIndex) => (
                    <Skeleton key={cardIndex} className="h-64 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
