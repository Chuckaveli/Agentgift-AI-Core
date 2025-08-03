import { Skeleton } from "@/components/ui/skeleton"

export default function RegistryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-4 w-[500px] mx-auto" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center justify-between bg-white p-4 rounded-lg border">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>

        {/* Tabs */}
        <Skeleton className="h-10 w-full" />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
