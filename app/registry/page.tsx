import { AgentGiftMasterRegistry } from "@/components/registry/agent-gift-master-registry"

export default function RegistryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <AgentGiftMasterRegistry />
      </div>
    </div>
  )
}
