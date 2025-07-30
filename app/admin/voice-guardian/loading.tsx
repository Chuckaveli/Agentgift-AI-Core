export default function VoiceGuardianLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Initializing Voice Guardian</h2>
          <p className="text-purple-200">Authenticating admin access and preparing voice systems...</p>
        </div>
        <div className="w-64 h-2 bg-purple-900 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
