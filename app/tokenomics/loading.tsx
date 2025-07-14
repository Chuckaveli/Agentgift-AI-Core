import { Skeleton } from "@/components/ui/skeleton"

export default function TokenomicsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section Skeleton */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Skeleton className="h-8 w-32 mx-auto bg-gray-700" />
          <Skeleton className="h-16 w-full max-w-2xl mx-auto bg-gray-700" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto bg-gray-700" />
          <div className="mx-auto max-w-md">
            <Skeleton className="h-3 w-full bg-gray-700 rounded-full" />
          </div>
          <Skeleton className="h-12 w-48 mx-auto bg-gray-700" />
        </div>
      </section>

      {/* Content Sections Skeleton */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-8 w-64 mx-auto bg-gray-700" />
            <Skeleton className="h-6 w-96 mx-auto bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-gray-700" />
            ))}
          </div>
        </div>
      </section>

      {/* More sections */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-8 w-64 mx-auto bg-gray-700" />
            <Skeleton className="h-6 w-96 mx-auto bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-gray-700" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
