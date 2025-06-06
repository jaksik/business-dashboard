'use client'

import { AnalyticsData } from './types'

interface CategorizationStatsProps {
  analytics: AnalyticsData | null
}

export default function CategorizationStats({ analytics }: CategorizationStatsProps) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const stats = analytics.summary

  const statItems = [
    { name: 'Total Runs', value: stats.totalRuns.toLocaleString() },
    { name: 'Completed Runs', value: stats.completedRuns.toLocaleString() },
    { name: 'Success Rate', value: `${stats.successRate.toFixed(1)}%` },
    { name: 'Total Articles', value: stats.totalArticlesProcessed.toLocaleString() },
    { name: 'Avg. Processing Time', value: `${(stats.avgProcessingTimeMs / 1000).toFixed(2)}s` },
    { name: 'Total Tokens Used', value: stats.totalTokens.toLocaleString() },
    { name: 'Estimated Cost', value: `$${stats.totalCost.toFixed(4)}` },
  ]

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <div key={item.name} className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-medium text-gray-500 truncate">{item.name}</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
