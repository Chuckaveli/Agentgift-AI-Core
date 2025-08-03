import { Suspense } from "react"
import AgentGiftAssistantDashboard from "@/components/assistants/agent-gift-assistant-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssistantsPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<AssistantDashboardSkeleton />}>
        <AgentGiftAssistantDashboard />
      </Suspense>
    </div>
  )
}

function AssistantDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-4 w-[500px] mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  )
}
