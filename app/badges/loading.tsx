export default function BadgesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="flex justify-center gap-8">
              <div className="text-center space-y-2">
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
              <div className="text-center space-y-2">
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
              <div className="text-center space-y-2">
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-96"></div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
