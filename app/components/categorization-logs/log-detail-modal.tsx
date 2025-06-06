'use client'

import { useState } from 'react'
import { CategorizationLog, DetailedCategorizationLog } from './types'

interface LogDetailModalProps {
  log: CategorizationLog
  onClose: () => void
}

export default function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const [detailedLog, setDetailedLog] = useState<DetailedCategorizationLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'analytics'>('overview')

  const fetchDetailedLog = async () => {
    if (detailedLog) return // Already fetched
    
    setLoading(true)
    try {
      const response = await fetch(`/api/categorization-logs/${log._id}`)
      if (response.ok) {
        const data = await response.json()
        setDetailedLog(data)
      }
    } catch (error) {
      console.error('Failed to fetch detailed log:', error)
    }
    setLoading(false)
  }

  // Fetch details when modal opens
  useState(() => {
    fetchDetailedLog()
  })

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const seconds = Math.round(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'completed_with_errors':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getSuccessRate = () => {
    if (log.totalArticlesAttempted === 0) return 0
    return Math.round((log.totalArticlesSuccessful / log.totalArticlesAttempted) * 100)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Categorization Run Details
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Run ID: {log._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'articles', label: 'Article Results' },
              { key: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'articles' | 'analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Run Information</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Status:</dt>
                    <dd>
                      <span className={getStatusBadge(log.status)}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Started:</dt>
                    <dd className="text-sm text-gray-900">{formatDateTime(log.startTime)}</dd>
                  </div>
                  {log.endTime && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Completed:</dt>
                      <dd className="text-sm text-gray-900">{formatDateTime(log.endTime)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Duration:</dt>
                    <dd className="text-sm text-gray-900">{formatDuration(log.processingTimeMs)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Triggered by:</dt>
                    <dd className="text-sm text-gray-900 capitalize">{log.triggeredBy}</dd>
                  </div>
                </dl>
              </div>

              {/* Processing Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Processing Statistics</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Articles Attempted:</dt>
                    <dd className="text-sm text-gray-900">{log.totalArticlesAttempted}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Successful:</dt>
                    <dd className="text-sm text-green-600">{log.totalArticlesSuccessful}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Failed:</dt>
                    <dd className="text-sm text-red-600">{log.totalArticlesFailed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Success Rate:</dt>
                    <dd className="text-sm text-gray-900">{getSuccessRate()}%</dd>
                  </div>
                </dl>
              </div>

              {/* OpenAI Usage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">OpenAI Usage</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Model:</dt>
                    <dd className="text-sm text-gray-900">{log.openaiUsage?.modelUsed || log.openaiModel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Total Tokens:</dt>
                    <dd className="text-sm text-gray-900">{log.openaiUsage?.totalTokens?.toLocaleString() || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Prompt Tokens:</dt>
                    <dd className="text-sm text-gray-900">{log.openaiUsage?.promptTokens?.toLocaleString() || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Completion Tokens:</dt>
                    <dd className="text-sm text-gray-900">{log.openaiUsage?.completionTokens?.toLocaleString() || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Estimated Cost:</dt>
                    <dd className="text-sm text-gray-900">${log.openaiUsage?.estimatedCostUSD?.toFixed(4) || '0.0000'}</dd>
                  </div>
                </dl>
              </div>

              {/* Errors */}
              {log.processingErrors && log.processingErrors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3">Processing Errors</h4>
                  <ul className="space-y-1">
                    {log.processingErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'articles' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading article results...</p>
                </div>
              ) : detailedLog?.articleResults ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Article Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          News Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tech Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailedLog.articleResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={result.title}>
                              {result.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.newsCategory}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.techCategory}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${result.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{result.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={result.status === 'success' ? 
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' :
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
                            }>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No article results available</p>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Distribution */}
              {detailedLog?.newsCategoryDistribution && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">News Category Distribution</h4>
                  <dl className="space-y-2">
                    {Object.entries(detailedLog.newsCategoryDistribution).map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <dt className="text-sm text-gray-500">{category}:</dt>
                        <dd className="text-sm text-gray-900">{count}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {detailedLog?.techCategoryDistribution && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Tech Category Distribution</h4>
                  <dl className="space-y-2">
                    {Object.entries(detailedLog.techCategoryDistribution).map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <dt className="text-sm text-gray-500">{category}:</dt>
                        <dd className="text-sm text-gray-900">{count}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
