'use client'

import { useState } from 'react'
import { Source } from './types'

interface SourcesListProps {
  sources: Source[]
  loading: boolean
  onSourceUpdated: (updatedSource: Source) => void
  onSourceDeleted: (deletedSourceId: string) => void
  onFetchSingle: (sourceId: string) => void
}

export function SourcesList({ 
  sources, 
  loading, 
  onSourceUpdated, 
  onSourceDeleted, 
  onFetchSingle 
}: SourcesListProps) {
  const [fetchingId, setFetchingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'rss' | 'html'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || source.type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && source.isActive) ||
                         (filterStatus === 'inactive' && !source.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleToggleActive = async (sourceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        const updatedSource = await response.json()
        onSourceUpdated(updatedSource)
      }
    } catch (error) {
      console.error('Failed to toggle source status:', error)
    }
  }

  const handleDeleteSource = async (sourceId: string, sourceName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${sourceName}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onSourceDeleted(sourceId)
      }
    } catch (error) {
      console.error('Failed to delete source:', error)
    }
  }

  const handleFetchArticles = async (sourceId: string) => {
    setFetchingId(sourceId)
    try {
      await onFetchSingle(sourceId)
    } finally {
      setFetchingId(null)
    }
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading sources...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sources ({filteredSources.length}{sources.length !== filteredSources.length && ` of ${sources.length}`})
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'rss' | 'html')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="rss">RSS Only</option>
              <option value="html">HTML Only</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sources List */}
      {filteredSources.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {sources.length === 0 
            ? "No sources configured. Add your first source above."
            : "No sources match your current filters."
          }
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredSources.map((source) => (
            <div key={source._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Source Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                    
                    {/* Status Toggle */}
                    <button
                      onClick={() => handleToggleActive(source._id, source.isActive)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        source.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {source.isActive ? '✓ Active' : '○ Inactive'}
                    </button>
                    
                    {/* Type Badge */}
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {source.type.toUpperCase()}
                    </span>
                    
                    {/* Fetch Status */}
                    <span className={getStatusBadge(source.fetchStatus.lastFetchStatus)}>
                      {source.fetchStatus.lastFetchStatus || 'Never fetched'}
                    </span>
                  </div>
                  
                  {/* URL */}
                  <p className="text-gray-600 mb-2 break-all">{source.url}</p>
                  
                  {/* Fetch Details */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <p><strong>Last fetched:</strong> {formatDate(source.fetchStatus.lastFetchedAt)}</p>
                    {source.fetchStatus.lastFetchMessage && (
                      <p><strong>Last result:</strong> {source.fetchStatus.lastFetchMessage}</p>
                    )}
                    {source.fetchStatus.lastFetchError && (
                      <p className="text-red-600"><strong>Last error:</strong> {source.fetchStatus.lastFetchError}</p>
                    )}
                    {source.fetchStatus.lastFetchSavedArticles !== undefined && (
                      <p><strong>Articles saved:</strong> {source.fetchStatus.lastFetchSavedArticles}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="ml-6 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleFetchArticles(source._id)}
                    disabled={fetchingId === source._id || !source.isActive}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-400 text-blue-700 rounded text-sm font-medium flex items-center gap-1"
                  >
                    {fetchingId === source._id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                        Fetching...
                      </>
                    ) : (
                      <>📡 Fetch</>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteSource(source._id, source.name)}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
