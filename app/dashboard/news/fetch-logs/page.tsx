'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedLayout } from '@/app/components/auth/protected-layout'
import { FetchLogsFilters } from '@/app/components/fetch-logs/fetch-logs-filters'
import { FetchLogsStatsComponent } from '@/app/components/fetch-logs/fetch-logs-stats'
import { FetchLogsList } from '@/app/components/fetch-logs/fetch-logs-list'
import type { FetchLog, FetchLogsStats, FetchLogsFilters as FilterType, FetchLogsResponse } from '@/app/components/fetch-logs/types'

export default function FetchLogsPage() {
  const [logs, setLogs] = useState<FetchLog[]>([])
  const [stats, setStats] = useState<FetchLogsStats>({
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    totalArticlesSaved: 0,
    totalDuplicatesSkipped: 0,
    avgExecutionTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterType>({
    limit: 25
  })

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      
      const searchParams = new URLSearchParams({
        limit: filters.limit.toString()
      })
      
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.jobType) searchParams.append('jobType', filters.jobType)

      const response = await fetch(`/api/jobs/article-fetch/logs?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data: FetchLogsResponse = await response.json()
      
      if (data.success) {
        setLogs(data.data.logs)
        setStats(data.data.stats)
      } else {
        throw new Error('API returned error')
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      // Keep existing data on error, just stop loading
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleRefresh = () => {
    fetchLogs()
  }

  const handleCleanup = () => {
    // Refresh data after cleanup
    fetchLogs()
  }

  return (
    <ProtectedLayout title="Fetch Logs">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Stats */}
          <div className="mb-8">
            <FetchLogsStatsComponent stats={stats} loading={loading} />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FetchLogsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
              onCleanup={handleCleanup}
              loading={loading}
            />
          </div>

          {/* Logs List */}
          <FetchLogsList logs={logs} loading={loading} />

          {/* No more data indicator */}
          {!loading && logs.length === filters.limit && (
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Showing {logs.length} most recent logs. Adjust filters to see different results.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}