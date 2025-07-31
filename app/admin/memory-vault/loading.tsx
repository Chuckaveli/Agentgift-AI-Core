export default function MemoryVaultLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🧠</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-purple-200">Accessing Memory Vault</h2>
          <div className="space-y-1 text-sm text-purple-300">
            <p className="opacity-100">🔐 Authenticating admin access...</p>
            <p className="opacity-75">🧠 Loading emotional intelligence systems...</p>
            <p className="opacity-50">📊 Preparing memory analytics...</p>
            <p className="opacity-25">🎙️ Initializing voice recognition...</p>
          </div>
        </div>

        <div className="w-64 bg-purple-900/30 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>

        <p className="text-xs text-purple-400 italic">
          "Memories are the threads that weave the fabric of understanding..."
        </p>
      </div>
    </div>
  )
}
