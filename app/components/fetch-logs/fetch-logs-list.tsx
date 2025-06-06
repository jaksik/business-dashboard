'use client'

import { useState } from 'react'
import type { FetchLog } from './types'

interface FetchLogsListProps {
  logs: FetchLog[]
  loading?: boolean
}

export function FetchLogsList({ logs, loading = false }: FetchLogsListProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'running':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'partial':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getJobTypeBadge = (jobType: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    
    switch (jobType) {
      case 'bulk':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'single':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getSourceStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading fetch logs...</span>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fetch logs found</h3>
          <p>Try adjusting your filters or run a fetch job to see logs here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const isExpanded = expandedLogs.has(log._id)
        const duration = log.endTime 
          ? new Date(log.endTime).getTime() - new Date(log.startTime).getTime()
          : 0

        return (
          <div key={log._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleLogExpansion(log._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={getStatusBadge(log.status)}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                    <span className={getJobTypeBadge(log.jobType)}>
                      {log.jobType === 'bulk' ? 'Bulk Fetch' : 'Single Source'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Job ID: <span className="font-mono text-xs">{log.jobId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {formatDate(log.startTime)}
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Summary row */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <span className="text-gray-600">
                    Sources: <span className="font-medium text-gray-900">{log.totalSources}</span>
                  </span>
                  <span className="text-gray-600">
                    Articles: <span className="font-medium text-green-600">{log.summary.totalArticlesSaved}</span>
                    {log.summary.totalDuplicatesSkipped > 0 && (
                      <span className="text-yellow-600"> (+{log.summary.totalDuplicatesSkipped} skipped)</span>
                    )}
                  </span>
                  {log.summary.totalErrors > 0 && (
                    <span className="text-red-600">
                      Errors: <span className="font-medium">{log.summary.totalErrors}</span>
                    </span>
                  )}
                </div>
                
                {duration > 0 && (
                  <span className="text-gray-500 text-xs">
                    Duration: {formatDuration(duration)}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Job Errors */}
                {log.jobErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Job Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {log.jobErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source Results */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Source Results ({log.sourceResults.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {log.sourceResults.map((result, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{getSourceStatusIcon(result.status)}</span>
                            <span className="font-medium text-gray-900">{result.sourceName}</span>
                            {result.maxArticles && (
                              <span className="text-xs text-gray-500">(max: {result.maxArticles})</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDuration(result.executionTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Found: <span className="font-medium">{result.totalArticles}</span></span>
                          <span>Saved: <span className="font-medium text-green-600">{result.savedArticles}</span></span>
                          {result.skippedDuplicates > 0 && (
                            <span>Skipped: <span className="font-medium text-yellow-600">{result.skippedDuplicates}</span></span>
                          )}
                        </div>

                        {result.errors.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <strong className="text-red-700">Errors:</strong>
                            <ul className="mt-1 text-red-600 space-y-1">
                              {result.errors.map((error, errorIndex) => (
                                <li key={errorIndex}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
