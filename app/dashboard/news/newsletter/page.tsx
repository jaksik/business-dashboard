'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from "../../../components/auth/protected-layout"
import { TECH_CATEGORIES } from '../../../../lib/constants/categories'
import type { TechCategory, NewsCategory } from '../../../../lib/constants/categories'

import { NewsletterHeader } from '../../../components/newsletter/newsletter-article-filter'
import { PendingChangesPanel } from '../../../components/newsletter/category-update-panel'
import { NewsLetterSections } from '../../../components/newsletter/newsletter-sections'
import type { NewsletterData, PendingChanges } from '../../../components/newsletter/types'

export default function NewsletterPreviewPage() {
  const [articleData, setArticleData] = useState<NewsletterData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(3)
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({})

  const fetchNewsletterData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/newsletter-preview?days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch newsletter data')

      const data = await response.json()
      setArticleData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => {
    const article = Object.values(articleData).flat().find(a => a._id === articleId)
    if (!article) return

    const existingChange = pendingChanges[articleId] || {
      articleId,
      originalNewsCategory: article.categorization.categories.news,
      originalTechCategory: article.categorization.categories.tech,
      rationale: ''
    }

    const updatedChange = {
      ...existingChange,
      ...(categoryType === 'news'
        ? { newNewsCategory: newCategory as NewsCategory }
        : { newTechCategory: newCategory as TechCategory }
      )
    }

    setPendingChanges(prev => ({
      ...prev,
      [articleId]: updatedChange
    }))
  }

  const updatePendingRationale = (articleId: string, rationale: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [articleId]: {
        ...prev[articleId],
        rationale
      }
    }))
  }

  const submitPendingChanges = async () => {
    try {
      setLoading(true)

      for (const change of Object.values(pendingChanges)) {
        const updateData: Record<string, unknown> = {
          isTrainingData: true,
          rationale: change.rationale
        }

        if (change.newNewsCategory && change.newNewsCategory !== change.originalNewsCategory) {
          updateData.newsCategory = change.newNewsCategory
        }

        if (change.newTechCategory && change.newTechCategory !== change.originalTechCategory) {
          updateData.techCategory = change.newTechCategory
        }

        const response = await fetch(`/api/articles/${change.articleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) throw new Error('Failed to update article')
      }

      // Clear pending changes and refresh data
      setPendingChanges({})
      await fetchNewsletterData()
    } catch (err) {
      console.error('Error submitting changes:', err)
      alert('Failed to submit changes')
    } finally {
      setLoading(false)
    }
  }

  const cancelPendingChanges = () => {
    setPendingChanges({})
  }

  useEffect(() => {
    fetchNewsletterData()
  }, [days]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <ProtectedLayout title="📰 Newsletter Preview">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading newsletter preview...</span>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )

  if (error) return (
    <ProtectedLayout title="📰 Newsletter Preview">
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium">Error loading newsletter preview</h3>
              <p className="mt-1 text-sm">{error}</p>
              <button
                onClick={fetchNewsletterData}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )

  const totalArticles = Object.values(articleData).flat().length
  const newsletterArticles = Object.values(articleData).flat().filter(article =>
    article.categorization.categories.news !== 'Not Relevant' &&
    article.categorization.categories.tech !== 'Not Relevant'
  ).length

  const pendingChangesCount = Object.keys(pendingChanges).length

  return (
    <ProtectedLayout title="📰 Newsletter Preview">
      <div className="space-y-6">
        {/* Header with day selector and stats */}
        <NewsletterHeader
          days={days}
          onDaysChange={setDays}
          newsletterArticles={newsletterArticles}
          totalArticles={totalArticles}
        />

        {/* Pending Changes Panel */}
        {pendingChangesCount > 0 && (
          <PendingChangesPanel
            pendingChanges={pendingChanges}
            onSubmit={submitPendingChanges}
            onCancel={cancelPendingChanges}
          />
        )}

        {/* Newsletter Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">

          <div className="p-6 space-y-8">
            {TECH_CATEGORIES.map(techCategory => (
              <NewsLetterSections
                key={techCategory}
                techCategory={techCategory}
                articleData={articleData}
                onUpdateCategory={handleCategoryChange}
                pendingChanges={pendingChanges}
                onUpdateRationale={updatePendingRationale}
              />
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}


