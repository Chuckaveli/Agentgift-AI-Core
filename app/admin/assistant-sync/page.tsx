import type { Metadata } from "next"
import { AssistantSyncPanel } from "@/components/admin/assistant-sync-panel"

export const metadata: Metadata = {
  title: "Assistant Registry Sync | AgentGift Admin",
  description: "Sync and manage AI assistants across the AgentGift Giftverse ecosystem",
}

export default function AssistantSyncPage() {
  return (
    <div className="container mx-auto py-8">
      <AssistantSyncPanel />
    </div>
  )
}
