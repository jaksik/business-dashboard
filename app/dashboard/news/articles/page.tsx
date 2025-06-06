'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedLayout } from "../../../components/auth/protected-layout"
import { ArticleFiltersComponent } from "../../../components/articles/article-filters"
import { ArticlesList } from "../../../components/articles/articles-list"
import { Pagination } from "../../../components/articles/pagination"
import { ArticleFilters, ArticleResponse, FilterOptions } from "../../../components/articles/types"

const defaultFilters: ArticleFilters = {
  search: '',
  source: '',
  category: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'fetchedAt',
  sortOrder: 'desc',
  limit: 100,
  page: 1
}

export default function ArticlesPage() {
  const [filters, setFilters] = useState<ArticleFilters>(defaultFilters)
  const [articleData, setArticleData] = useState<ArticleResponse | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ sources: [], categories: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Bulk selection state
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false)

  const fetchArticles = useCallback(async (currentFilters: ArticleFilters) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      
      // Add all filter parameters
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/articles?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }

      const data: ArticleResponse = await response.json()
      setArticleData(data)
      setFilterOptions(data.filters)

    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArticles(filters)
    }, filters.search ? 500 : 0) // 500ms delay for search, immediate for other filters

    return () => clearTimeout(timeoutId)
  }, [filters, fetchArticles])

  const handleFiltersChange = (newFilters: Partial<ArticleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleArticleDeleted = (articleId: string) => {
    // Update the local state to remove the deleted article
    setArticleData(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        articles: prev.articles.filter(article => article._id !== articleId),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1
        }
      }
    })
  }

  // Bulk selection handlers
  const handleArticleSelect = (articleId: string) => {
    setSelectedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (isSelectAllChecked) {
      setSelectedArticles(new Set())
    } else {
      const allIds = new Set(articleData?.articles.map(article => article._id) || [])
      setSelectedArticles(allIds)
    }
    setIsSelectAllChecked(!isSelectAllChecked)
  }

  // Update select all state when articles change or selection changes
  useEffect(() => {
    const totalArticles = articleData?.articles.length || 0
    const selectedCount = selectedArticles.size
    setIsSelectAllChecked(totalArticles > 0 && selectedCount === totalArticles)
  }, [selectedArticles, articleData?.articles])

  const handleBulkDelete = async () => {
    const count = selectedArticles.size
    const confirmed = window.confirm(
      `Are you sure you want to delete ${count} selected article${count > 1 ? 's' : ''}? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setLoading(true)
      
      // Call bulk delete API
      const response = await fetch('/api/articles/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: Array.from(selectedArticles) })
      })

      if (!response.ok) throw new Error('Failed to delete articles')

      // Update local state
      setArticleData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          articles: prev.articles.filter(article => !selectedArticles.has(article._id)),
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - selectedArticles.size
          }
        }
      })

      // Clear selection
      setSelectedArticles(new Set())
      setIsSelectAllChecked(false)

    } catch (error) {
      console.error('Bulk delete failed:', error)
      setError('Failed to delete selected articles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedLayout title="News Articles">
      <div className="space-y-6">

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error loading articles</h3>
                <p className="mt-1 text-sm">{error}</p>
                <button
                  onClick={() => fetchArticles(filters)}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <ArticleFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          filterOptions={filterOptions}
          resultsCount={articleData?.articles.length || 0}
          totalCount={articleData?.pagination.total || 0}
          selectedCount={selectedArticles.size}
          isSelectAllChecked={isSelectAllChecked}
          onSelectAll={handleSelectAll}
        />

        {/* Bulk Actions Bar */}
        {selectedArticles.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedArticles.size} article{selectedArticles.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedArticles(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    🗑️ Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Articles List */}
        <ArticlesList
          articles={articleData?.articles || []}
          loading={loading}
          onArticleDeleted={handleArticleDeleted}
          selectedArticles={selectedArticles}
          onArticleSelect={handleArticleSelect}
        />

        {/* Pagination */}
        {articleData && (
          <Pagination
            currentPage={articleData.pagination.page}
            totalPages={articleData.pagination.pages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </ProtectedLayout>
  )
}