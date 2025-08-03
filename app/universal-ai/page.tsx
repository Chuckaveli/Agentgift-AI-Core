import { Suspense } from "react"
import { UniversalAIPluginLoader } from "@/components/universal/universal-ai-plugin-loader"
import { Skeleton } from "@/components/ui/skeleton"

export default function UniversalAIPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<UniversalAIPageSkeleton />}>
        <UniversalAIPluginLoader showAdminControls={true} autoRefresh={true} />
      </Suspense>
    </div>
  )
}

function UniversalAIPageSkeleton() {
  return (
    <div className="space-y-6">
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

      <Skeleton className="h-20 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  )
}
