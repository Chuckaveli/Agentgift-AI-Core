import { Skeleton } from "@/components/ui/skeleton"

export default function UniversalAILoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Skeleton className="h-20 w-full" />

      {/* Category Sections */}
      {Array.from({ length: 3 }).map((_, categoryIndex) => (
        <div key={categoryIndex} className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, cardIndex) => (
              <Skeleton key={cardIndex} className="h-80 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
