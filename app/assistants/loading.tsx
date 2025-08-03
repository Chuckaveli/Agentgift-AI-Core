import { Skeleton } from "@/components/ui/skeleton"

export default function AssistantsLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-4 w-[500px] mx-auto" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
