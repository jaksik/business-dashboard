'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from "../../../components/auth/protected-layout"
import { TECH_CATEGORIES } from '../../../../lib/constants/categories'
import type { TechCategory, NewsCategory } from '../../../../lib/constants/categories'

// Import newsletter components
import { NewsletterHeader } from '../../../components/newsletter/NewsletterHeader'
import { PendingChangesPanel } from '../../../components/newsletter/PendingChangesPanel'
import { TechSection } from '../../../components/newsletter/TechSection'
import { QualityControlSection } from '../../../components/newsletter/QualityControlSection'
import type { 
  NewsletterData, 
  PendingChanges 
} from '../../../components/newsletter/types'

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
      <div className="p-6">
        <div className="animate-pulse">Loading newsletter preview...</div>
      </div>
    </ProtectedLayout>
  )

  if (error) return (
    <ProtectedLayout title="📰 Newsletter Preview">
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    </ProtectedLayout>
  )

  const totalArticles = Object.values(articleData).flat().length
  const newsletterArticles = Object.values(articleData).flat().filter(article =>
    article.categorization.categories.news !== 'Likely Noise or Opinion' &&
    article.categorization.categories.tech !== 'Not Relevant'
  ).length

  const pendingChangesCount = Object.keys(pendingChanges).length

  return (
    <ProtectedLayout title="📰 Newsletter Preview">
      <div className="p-6 max-w-6xl mx-auto">
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            📬 Newsletter Content
          </h1>
          {TECH_CATEGORIES.filter(cat => cat !== 'Not Relevant').map(techCategory => (
            <TechSection
              key={techCategory}
              techCategory={techCategory}
              articleData={articleData}
              onUpdateCategory={handleCategoryChange}
              pendingChanges={pendingChanges}
              onUpdateRationale={updatePendingRationale}
            />
          ))}
        </div>

        {/* Quality Control Section */}
        <QualityControlSection
          articleData={articleData}
          onUpdateCategory={handleCategoryChange}
          pendingChanges={pendingChanges}
          onUpdateRationale={updatePendingRationale}
        />
      </div>
    </ProtectedLayout>
  )
}


