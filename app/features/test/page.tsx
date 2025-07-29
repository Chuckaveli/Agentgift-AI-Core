"use client"

export default function TestFeaturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Test Feature Page
        </h1>
        <p className="text-lg text-gray-600">
          If you can see this page, the features route is working!
        </p>
      </div>
    </div>
  )
} 