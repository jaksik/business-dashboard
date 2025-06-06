'use client'

import type { FetchLogsStats } from './types'

interface FetchLogsStatsProps {
  stats: FetchLogsStats
  loading?: boolean
}

export function FetchLogsStatsComponent({ stats, loading = false }: FetchLogsStatsProps) {
  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getSuccessRate = () => {
    if (stats.totalJobs === 0) return 0
    return Math.round((stats.successfulJobs / stats.totalJobs) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <h3 className="text-lg font-semibold text-gray-900">Loading Stats...</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Last 7 Days Stats</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
          <div className="text-sm text-blue-700">Total Jobs</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.successfulJobs}</div>
          <div className="text-sm text-green-700">Successful</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failedJobs}</div>
          <div className="text-sm text-red-700">Failed</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{getSuccessRate()}%</div>
          <div className="text-sm text-purple-700">Success Rate</div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.totalArticlesSaved.toLocaleString()}</div>
          <div className="text-sm text-amber-700">Articles Saved</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">
            {formatDuration(stats.avgExecutionTime || 0)}
          </div>
          <div className="text-sm text-gray-700">Avg Duration</div>
        </div>
      </div>
      
      {stats.totalDuplicatesSkipped > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            📋 <strong>{stats.totalDuplicatesSkipped.toLocaleString()}</strong> duplicate articles were skipped
          </div>
        </div>
      )}
    </div>
  )
}
