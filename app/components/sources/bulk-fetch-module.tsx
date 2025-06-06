'use client'

import { useState, useCallback } from 'react'

interface BulkFetchProgress {
  isRunning: boolean
  currentSource: string
  processedSources: number
  totalSources: number
  articlesFound: number
  articlesSaved: number
  errors: string[]
  startTime?: Date
}

interface BulkFetchProps {
  onFetchComplete: () => void
}

export function BulkFetchModule({ onFetchComplete }: BulkFetchProps) {
  const [progress, setProgress] = useState<BulkFetchProgress>({
    isRunning: false,
    currentSource: '',
    processedSources: 0,
    totalSources: 0,
    articlesFound: 0,
    articlesSaved: 0,
    errors: []
  })
  const [maxArticles, setMaxArticles] = useState(10)

  const startBulkFetch = useCallback(async () => {
    setProgress({
      isRunning: true,
      currentSource: 'Initializing...',
      processedSources: 0,
      totalSources: 0,
      articlesFound: 0,
      articlesSaved: 0,
      errors: [],
      startTime: new Date()
    })

    try {
      const response = await fetch('/api/jobs/article-fetch/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxArticles })
      })

      if (!response.ok) {
        throw new Error('Failed to start bulk fetch')
      }

      const result = await response.json()
      
      // Update final progress
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        currentSource: 'Completed',
        processedSources: result.data?.totalSources || prev.totalSources,
        totalSources: result.data?.totalSources || prev.totalSources,
        articlesFound: result.data?.totalArticlesFound || prev.articlesFound,
        articlesSaved: result.data?.totalArticlesSaved || prev.articlesSaved
      }))

      // Refresh sources list
      onFetchComplete()

    } catch (error) {
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        currentSource: 'Failed',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }))
    }
  }, [maxArticles, onFetchComplete])

  const resetProgress = () => {
    setProgress({
      isRunning: false,
      currentSource: '',
      processedSources: 0,
      totalSources: 0,
      articlesFound: 0,
      articlesSaved: 0,
      errors: []
    })
  }

  const formatDuration = (startTime?: Date) => {
    if (!startTime) return ''
    const duration = Date.now() - startTime.getTime()
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const progressPercentage = progress.totalSources > 0 
    ? Math.round((progress.processedSources / progress.totalSources) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">🚀 Bulk Article Fetch</h3>
          <p className="text-sm text-gray-600">Fetch articles from all active sources</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Articles per source:</label>
            <select
              value={maxArticles}
              onChange={(e) => setMaxArticles(parseInt(e.target.value))}
              disabled={progress.isRunning}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value={5}>5 articles</option>
              <option value={10}>10 articles</option>
              <option value={25}>25 articles</option>
              <option value={50}>50 articles</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              // If there's previous data, reset it before starting new fetch
              if (progress.totalSources > 0 && !progress.isRunning) {
                resetProgress()
              }
              startBulkFetch()
            }}
            disabled={progress.isRunning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {progress.isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Fetching...
              </>
            ) : (
              <>
                <span>📡</span>
                Start Bulk Fetch
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Display - Always visible */}
      <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {progress.isRunning ? 'Processing...' : progress.totalSources > 0 ? 'Completed' : 'Ready to fetch'}
              </span>
              <span className="text-gray-600">
                {progress.processedSources}/{progress.totalSources} sources
                {progress.totalSources > 0 && ` (${progressPercentage}%)`}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress.isRunning ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {progress.isRunning && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {progress.currentSource || (progress.totalSources > 0 ? 'Completed' : 'No bulk fetch run yet')}
                </p>
                {progress.startTime && (
                  <p className="text-xs text-gray-600">
                    Duration: {formatDuration(progress.startTime)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {progress.articlesSaved} articles saved
              </p>
              <p className="text-xs text-gray-600">
                {progress.articlesFound} found
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.processedSources}</div>
              <div className="text-xs text-blue-700">Sources Processed</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{progress.articlesFound}</div>
              <div className="text-xs text-green-700">Articles Found</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{progress.articlesSaved}</div>
              <div className="text-xs text-purple-700">Articles Saved</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{progress.errors.length}</div>
              <div className="text-xs text-red-700">Errors</div>
            </div>
          </div>

          {/* Errors */}
          {progress.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Errors ({progress.errors.length})</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {progress.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700">• {error}</p>
                ))}
              </div>
            </div>
          )}

        </div>
    </div>
  )
}
