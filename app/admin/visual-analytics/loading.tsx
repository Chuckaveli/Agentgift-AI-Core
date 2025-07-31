export default function VisualAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Initializing Visual Analytics</h2>
          <p className="text-purple-200">Gathering intelligence signals from the Giftverse...</p>
        </div>

        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>

        <div className="text-sm text-purple-300 space-y-1">
          <p>• Analyzing user XP patterns</p>
          <p>• Processing feature usage data</p>
          <p>• Mapping gift interaction heatmaps</p>
          <p>• Tracking emotional intelligence trends</p>
          <p>• Compiling voice engagement metrics</p>
        </div>
      </div>
    </div>
  )
}
