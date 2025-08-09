import { Suspense } from "react"
import { EcosystemHealthPanel } from "@/components/admin/ecosystem-health-panel"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function EcosystemHealthLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EcosystemHealthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<EcosystemHealthLoading />}>
        <EcosystemHealthPanel autoRefresh={true} refreshInterval={15000} />
      </Suspense>
    </div>
  )
}
