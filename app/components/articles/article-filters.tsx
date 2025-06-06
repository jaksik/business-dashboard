'use client'

import { useState } from 'react'
import { ArticleFilters, FilterOptions } from './types'

interface ArticleFiltersProps {
  filters: ArticleFilters
  onFiltersChange: (filters: Partial<ArticleFilters>) => void
  filterOptions: FilterOptions
  resultsCount: number
  totalCount: number
}

export function ArticleFiltersComponent({
  filters,
  onFiltersChange,
  filterOptions,
  resultsCount,
  totalCount
}: ArticleFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleQuickDateFilter = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    onFiltersChange({
      dateFrom: date.toISOString().split('T')[0],
      dateTo: '',
      page: 1
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      source: '',
      category: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'fetchedAt',
      sortOrder: 'desc',
      page: 1
    })
  }

  const activeFiltersCount = [
    filters.search,
    filters.source,
    filters.category,
    filters.status,
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Main Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Articles
          </label>
          <input
            type="text"
            placeholder="Search title, description, source..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => onFiltersChange({ source: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sources</option>
            {filterOptions.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ category: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Results Per Page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Per Page
          </label>
          <select
            value={filters.limit}
            onChange={(e) => onFiltersChange({ limit: parseInt(e.target.value), page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="50">50 articles</option>
            <option value="100">100 articles</option>
            <option value="250">250 articles</option>
          </select>
        </div>
      </div>

      {/* Second Row with Sort and Advanced Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fetchedAt">Fetch Date</option>
              <option value="publishedDate">Published Date</option>
              <option value="title">Title</option>
              <option value="sourceName">Source</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc', page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {/* Results Counter */}
        <div className="text-sm text-gray-600">
          Showing {resultsCount.toLocaleString()} of {totalCount.toLocaleString()} articles
          {activeFiltersCount > 0 && (
            <span className="ml-2">
              ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active)
            </span>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ dateFrom: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ dateTo: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Date Filters and Clear */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Quick filters:</span>
            <button
              onClick={() => handleQuickDateFilter(1)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDateFilter(7)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickDateFilter(30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Last 30 Days
            </button>
            
            {activeFiltersCount > 0 && (
              <>
                <div className="border-l border-gray-300 h-6 mx-2"></div>
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
