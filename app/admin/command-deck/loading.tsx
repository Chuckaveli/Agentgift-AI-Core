export default function CommandDeckLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Command Icon */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Pulsing rings */}
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-purple-400 rounded-xl animate-ping opacity-20"></div>
            <div className="absolute inset-2 border-2 border-pink-400 rounded-lg animate-ping opacity-30 animation-delay-200"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Initializing Command Deck
          </h2>
          <p className="text-purple-200 animate-pulse">Connecting to AI Council...</p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3 max-w-md">
          <div className="flex items-center gap-3 text-sm text-purple-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Authenticating admin access</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-purple-300">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse animation-delay-300"></div>
            <span>Loading bot registry</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-purple-300">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-600"></div>
            <span>Initializing voice systems</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-purple-300">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-900"></div>
            <span>Preparing command interface</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Flavor Text */}
        <p className="text-sm text-gray-400 italic max-w-md">
          "Every great command begins with a moment of preparation..."
        </p>
      </div>
    </div>
  )
}
