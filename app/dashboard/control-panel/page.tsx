'use client'

import { useState, useEffect } from 'react'
import { Source } from '@/models'

interface Source {
  _id: string
  name: string
  url: string
  type: 'rss' | 'html'
  isActive: boolean
  fetchStatus: {
    lastFetchedAt?: Date
    lastFetchStatus?: 'success' | 'error' | 'pending'
    lastFetchMessage?: string
    lastFetchError?: string
    lastFetchSavedArticles?: number
  }
}

interface FetchResult {
  success: boolean
  data?: {
    jobId: string
    duration: number
    successfulSources: number
    totalSources: number
    totalArticlesSaved: number
  }
  error?: string
}

interface FetchLog {
  _id: string
  jobId: string
  jobType: 'single' | 'bulk'
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'partial'
  totalSources: number
  sourceResults: {
    sourceId: string
    sourceName: string
    status: 'success' | 'failed'
    maxArticles?: number
    totalArticles: number
    savedArticles: number
    skippedDuplicates: number
    errors: string[]
    executionTime: number
  }[]
  summary: {
    totalArticlesProcessed: number
    totalArticlesSaved: number
    totalDuplicatesSkipped: number
    totalErrors: number
    executionTime: number
  }
  createdAt: string
}

export default function ControlPanelPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingAll, setFetchingAll] = useState(false)
  const [fetchingSingle, setFetchingSingle] = useState<Record<string, boolean>>({})
  const [lastFetchResult, setLastFetchResult] = useState<FetchResult | null>(null)
  const [maxArticles, setMaxArticles] = useState<number>(10) // New state for article limit
  const [logs, setLogs] = useState<FetchLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Load sources on component mount
  useEffect(() => {
    loadSources()
    loadLogs()
  }, [])

  const loadSources = async () => {
    try {
      const response = await fetch('/api/sources')
      const data = await response.json()
      
      if (data.success) {
        setSources(data.data)
      } else {
        console.error('Failed to load sources:', data.error)
      }
    } catch (error) {
      console.error('Error loading sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await fetch('/api/jobs/article-fetch/logs?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data.logs)
      } else {
        console.error('Failed to load logs:', data.error)
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleFetchAll = async () => {
    setFetchingAll(true)
    setLastFetchResult(null)
    
    try {
      const response = await fetch('/api/jobs/article-fetch/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxArticles }), // Include article limit
      })
      
      const result = await response.json()
      setLastFetchResult(result)
      
      // Reload sources to get updated fetch status
      await loadSources()
      await loadLogs() // Reload logs after fetch
      
    } catch (error) {
      console.error('Bulk fetch failed:', error)
      setLastFetchResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setFetchingAll(false)
    }
  }

  const handleFetchSingle = async (sourceId: string) => {
    setFetchingSingle(prev => ({ ...prev, [sourceId]: true }))
    
    try {
      const response = await fetch('/api/jobs/article-fetch/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceId, maxArticles }), // Include article limit
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Reload sources to get updated fetch status
        await loadSources()
        await loadLogs() // Reload logs after single fetch
      } else {
        console.error('Single fetch failed:', result.error)
      }
      
    } catch (error) {
      console.error('Single fetch failed:', error)
    } finally {
      setFetchingSingle(prev => ({ ...prev, [sourceId]: false }))
    }
  }

  const handleFetchArticlesFromPrompt = async () => {
    const sourceId = prompt('Enter Source ID to fetch articles from:')
    if (!sourceId) return
    
    await handleFetchSingle(sourceId)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
  }

  const getStatusBadge = (status: string | undefined) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading sources...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Article Fetch Control Panel</h1>
        <p className="text-gray-600">Manage and trigger article fetching operations from your configured sources.</p>
      </div>

      {/* Bulk Fetch Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Operations</h2>
            <p className="text-gray-600">Fetch articles from all active sources at once or test single source by ID</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Article Limit Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="maxArticles" className="text-sm font-medium text-gray-700">
                Max Articles:
              </label>
              <input
                id="maxArticles"
                type="number"
                min="1"
                max="100"
                value={maxArticles}
                onChange={(e) => setMaxArticles(parseInt(e.target.value) || 10)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFetchAll}
                disabled={fetchingAll}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                {fetchingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    🚀 Fetch All Sources
                  </>
                )}
              </button>
              
              <button
                onClick={handleFetchArticlesFromPrompt}
                disabled={fetchingAll || Object.values(fetchingSingle).some(Boolean)}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                {Object.values(fetchingSingle).some(Boolean) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    📡 Fetch Single Source
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Last Fetch Result */}
        {lastFetchResult && (
          <div className={`p-4 rounded-lg border ${
            lastFetchResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium ${
                lastFetchResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {lastFetchResult.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            
            {lastFetchResult.success && lastFetchResult.data && (
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Job ID:</strong> {lastFetchResult.data.jobId}</p>
                <p><strong>Duration:</strong> {lastFetchResult.data.duration}ms</p>
                <p><strong>Sources:</strong> {lastFetchResult.data.successfulSources}/{lastFetchResult.data.totalSources} successful</p>
                <p><strong>Articles:</strong> {lastFetchResult.data.totalArticlesSaved} saved</p>
              </div>
            )}
            
            {lastFetchResult.error && (
              <p className="text-sm text-red-700">{lastFetchResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Sources ({sources.length})</h2>
        </div>
        
        {sources.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No sources configured. Add sources to start fetching articles.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sources.map((source) => (
              <div key={source._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        source.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {source.type.toUpperCase()}
                      </span>
                      <span className={getStatusBadge(source.fetchStatus.lastFetchStatus)}>
                        {source.fetchStatus.lastFetchStatus || 'Never fetched'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{source.url}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p><strong>Last fetched:</strong> {formatDate(source.fetchStatus.lastFetchedAt)}</p>
                      {source.fetchStatus.lastFetchMessage && (
                        <p><strong>Last result:</strong> {source.fetchStatus.lastFetchMessage}</p>
                      )}
                      {source.fetchStatus.lastFetchError && (
                        <p className="text-red-600"><strong>Last error:</strong> {source.fetchStatus.lastFetchError}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button
                      onClick={() => handleFetchSingle(source._id)}
                      disabled={fetchingSingle[source._id] || !source.isActive}
                      className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      {fetchingSingle[source._id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          Fetching...
                        </>
                      ) : (
                        <>
                          📡 Fetch
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Fetch Logs</h2>
          <button
            onClick={loadLogs}
            disabled={logsLoading}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            {logsLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Refreshing...
              </>
            ) : (
              '🔄 Refresh'
            )}
          </button>
        </div>
        
        {logsLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No fetch logs available. Run a fetch operation to see logs here.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log._id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">Job: {log.jobId}</h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {log.jobType.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        log.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Started: {new Date(log.startTime).toLocaleString()}
                      {log.endTime && ` • Duration: ${Math.round(log.summary.executionTime / 1000)}s`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-900 font-medium">
                      {log.summary.totalArticlesSaved} saved / {log.summary.totalArticlesProcessed} processed
                    </div>
                    <div className="text-gray-500 text-xs">
                      {log.totalSources} sources • {log.summary.totalDuplicatesSkipped} duplicates
                    </div>
                  </div>
                </div>
                
                {/* Source Results */}
                {log.sourceResults.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Source Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {log.sourceResults.map((result, idx) => (
                        <div key={idx} className="text-xs p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={result.status === 'success' ? '✅' : '❌'}></span>
                            <span className="font-medium truncate">{result.sourceName}</span>
                          </div>
                          <div className="text-gray-600">
                            {result.savedArticles} saved / {result.totalArticles} found
                            {result.maxArticles && (
                              <span className="text-blue-600"> (max: {result.maxArticles})</span>
                            )}
                          </div>
                          {result.errors.length > 0 && (
                            <div className="text-red-600 mt-1">
                              {result.errors[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
