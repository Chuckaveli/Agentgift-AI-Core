export default function AgentVaultLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
        <div className="h-8 bg-muted rounded w-64 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
            <div className="w-6 h-6 bg-muted-foreground/20 rounded mx-auto mb-2" />
            <div className="h-6 bg-muted-foreground/20 rounded mb-1" />
            <div className="h-4 bg-muted-foreground/20 rounded w-20 mx-auto" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-6 animate-pulse">
            <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded mb-4" />
            <div className="h-6 bg-muted-foreground/20 rounded mb-2" />
            <div className="h-4 bg-muted-foreground/20 rounded mb-4" />
            <div className="h-10 bg-muted-foreground/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
