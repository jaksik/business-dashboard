'use client'

import { useState } from 'react'
import type { FetchLogsFilters } from './types'

interface FetchLogsFiltersProps {
  filters: FetchLogsFilters
  onFiltersChange: (filters: Partial<FetchLogsFilters>) => void
  onRefresh: () => void
  onCleanup: () => void
  loading?: boolean
}

export function FetchLogsFilters({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  onCleanup,
  loading = false
}: FetchLogsFiltersProps) {
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [cleanupDays, setCleanupDays] = useState(30)

  const handleCleanup = async () => {
    if (cleanupDays < 1) return
    
    try {
      const response = await fetch('/api/jobs/article-fetch/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanDays: cleanupDays })
      })

      if (!response.ok) {
        throw new Error('Failed to cleanup logs')
      }

      const result = await response.json()
      alert(`Successfully deleted ${result.data.deletedCount} old logs`)
      onCleanup()
      setShowCleanupDialog(false)
    } catch (error) {
      console.error('Failed to cleanup logs:', error)
      alert('Failed to cleanup logs. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filters.jobType || ''}
              onChange={(e) => onFiltersChange({ jobType: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="single">Single Source</option>
              <option value="bulk">Bulk Fetch</option>
            </select>
          </div>

          {/* Limit */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <select
              value={filters.limit}
              onChange={(e) => onFiltersChange({ limit: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10 logs</option>
              <option value="25">25 logs</option>
              <option value="50">50 logs</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </button>

          <button
            onClick={() => setShowCleanupDialog(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            🧹 Cleanup
          </button>
        </div>
      </div>

      {/* Cleanup Dialog */}
      {showCleanupDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleanup Old Logs</h3>
            <p className="text-gray-600 mb-4">
              Delete logs older than the specified number of days. This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delete logs older than:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={cleanupDays}
                  onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCleanupDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanup}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
