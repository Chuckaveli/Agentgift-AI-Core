export default function AgentVaultLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Giftverse Mastermind AI...</p>
          <p className="text-sm text-muted-foreground mt-2">Connecting to auction chamber...</p>
        </div>
      </div>
    </div>
  )
}
