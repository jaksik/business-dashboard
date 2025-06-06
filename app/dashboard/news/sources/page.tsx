'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from "@/app/components/auth/protected-layout"
import { AddSourceForm } from "@/app/components/sources/add-source-form"
import { SourcesList } from "@/app/components/sources/sources-list"
import { BulkFetchModule } from "@/app/components/sources/bulk-fetch-module"
import { Source } from "@/app/components/sources/types"

export default function SourcesPage() {
    const [sources, setSources] = useState<Source[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSources = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/sources')
            if (!response.ok) {
                throw new Error('Failed to fetch sources')
            }
            const data = await response.json()
            setSources(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch sources')
            console.error('Error fetching sources:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleFetchSingle = async (sourceId: string) => {
        try {
            const response = await fetch('/api/jobs/article-fetch/single', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    sourceId,
                    maxArticles: 10 // Use default, system will apply global configuration
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch articles')
            }

            const result = await response.json()
            console.log('Fetch result:', result)
            
            // Refresh sources to update fetch status
            await fetchSources()
            
        } catch (err) {
            console.error('Error fetching articles:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchSources()
    }, [])

    const handleSourceAdded = () => {
        fetchSources()
    }

    const handleSourceUpdated = (updatedSource: Source) => {
        // Update the specific source in local state instead of refetching all
        setSources(prevSources => 
            prevSources.map(source => 
                source._id === updatedSource._id ? updatedSource : source
            )
        )
    }

    const handleSourceDeleted = (deletedSourceId: string) => {
        // Remove the deleted source from local state instead of refetching all
        setSources(prevSources => 
            prevSources.filter(source => source._id !== deletedSourceId)
        )
    }

    return (
        <ProtectedLayout title="News Sources Management">
            <div className="space-y-6">

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-red-600">❌</span>
                            <span className="text-red-800 font-medium">Error</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchSources}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Bulk Fetch Module */}
                <BulkFetchModule onFetchComplete={fetchSources} />

                {/* Add New Source Form */}
                <AddSourceForm onSourceAdded={handleSourceAdded} />

                {/* Sources List */}
                <SourcesList
                    sources={sources}
                    loading={loading}
                    onSourceUpdated={handleSourceUpdated}
                    onSourceDeleted={handleSourceDeleted}
                    onFetchSingle={handleFetchSingle}
                />

               
            </div>
        </ProtectedLayout>
    )
}