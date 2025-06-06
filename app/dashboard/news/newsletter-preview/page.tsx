'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from "../../../components/auth/protected-layout"
import { TECH_CATEGORIES, NEWS_CATEGORIES } from '../../../../lib/constants/categories'
import type { NewsCategory, TechCategory } from '../../../../lib/constants/categories'

interface NewsletterArticle {
  _id: string
  title: string
  link: string
  sourceName: string
  publishedDate?: Date
  metaDescription?: string
  categorization: {
    categories: {
      news?: NewsCategory
      tech?: TechCategory
    }
    confidence?: number
  }
}

interface NewsletterData {
  [key: string]: NewsletterArticle[]
}

interface PendingChange {
  articleId: string
  originalNewsCategory?: NewsCategory
  originalTechCategory?: TechCategory
  newNewsCategory?: NewsCategory
  newTechCategory?: TechCategory
  rationale: string
}

interface PendingChanges {
  [articleId: string]: PendingChange
}

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

  const renderTechSection = (techCategory: TechCategory) => {
    const articles = articleData[techCategory] || []
    const relevantArticles = articles.filter(article => 
      article.categorization.categories.news !== 'Likely Noise or Opinion'
    )

    if (relevantArticles.length === 0) return null

    // Sort by news priority
    const priorityOrder: { [key in NewsCategory]: number } = {
      'Top Story Candidate': 1,
      'Solid News': 2, 
      'Interesting but Lower Priority': 3,
      'Likely Noise or Opinion': 4
    }

    const sortedArticles = relevantArticles.sort((a, b) => {
      const aPriority = priorityOrder[a.categorization.categories.news || 'Likely Noise or Opinion']
      const bPriority = priorityOrder[b.categorization.categories.news || 'Likely Noise or Opinion']
      return aPriority - bPriority
    })

    return (
      <div key={techCategory} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📁 {techCategory} ({sortedArticles.length})
        </h2>
        <div className="space-y-2">
          {sortedArticles.map((article) => (
            <ArticleRow 
              key={article._id} 
              article={article} 
              onUpdateCategory={handleCategoryChange}
              pendingChange={pendingChanges[article._id]}
              onUpdateRationale={updatePendingRationale}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderQualityControlSection = () => {
    const noiseArticles = Object.values(articleData).flat().filter(article =>
      article.categorization.categories.news === 'Likely Noise or Opinion'
    )
    
    const notRelevantArticles = Object.values(articleData).flat().filter(article =>
      article.categorization.categories.tech === 'Not Relevant'
    )

    if (noiseArticles.length === 0 && notRelevantArticles.length === 0) return null

    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🔍 Quality Control - Review These Categories
        </h1>
        
        {noiseArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">
              🗨️ Likely Noise or Opinion ({noiseArticles.length})
            </h2>
            <div className="space-y-2">
              {noiseArticles.map((article) => (
                <ArticleRow 
                  key={article._id} 
                  article={article} 
                  onUpdateCategory={handleCategoryChange}
                  pendingChange={pendingChanges[article._id]}
                  onUpdateRationale={updatePendingRationale}
                />
              ))}
            </div>
          </div>
        )}

        {notRelevantArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              ❌ Not Relevant ({notRelevantArticles.length})
            </h2>
            <div className="space-y-2">
              {notRelevantArticles.map((article) => (
                <ArticleRow 
                  key={article._id} 
                  article={article} 
                  onUpdateCategory={handleCategoryChange}
                  pendingChange={pendingChanges[article._id]}
                  onUpdateRationale={updatePendingRationale}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) return (
    <ProtectedLayout>
      <div className="p-6">
        <div className="animate-pulse">Loading newsletter preview...</div>
      </div>
    </ProtectedLayout>
  )

  if (error) return (
    <ProtectedLayout>
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
    <ProtectedLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            📰 Newsletter Preview
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="days" className="text-sm font-medium text-gray-700">
                Last
              </label>
              <select
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {newsletterArticles} newsletter articles • {totalArticles} total articles
            </div>
          </div>
        </div>

        {/* Pending Changes Section */}
        {pendingChangesCount > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-yellow-800">
                ⏳ Pending Changes ({pendingChangesCount})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={cancelPendingChanges}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel All
                </button>
                <button
                  onClick={submitPendingChanges}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={Object.values(pendingChanges).some(change => !change.rationale.trim())}
                >
                  Submit All Changes
                </button>
              </div>
            </div>
            <div className="text-sm text-yellow-700 mb-2">
              Please provide rationale for all changes before submitting.
            </div>
            {Object.values(pendingChanges).some(change => !change.rationale.trim()) && (
              <div className="text-sm text-red-600">
                ⚠️ Some changes are missing rationale and cannot be submitted.
              </div>
            )}
          </div>
        )}

        {/* Newsletter Content Sections */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            📬 Newsletter Content
          </h1>
          {TECH_CATEGORIES.filter(cat => cat !== 'Not Relevant').map(renderTechSection)}
        </div>

        {/* Quality Control Section */}
        {renderQualityControlSection()}
      </div>
    </ProtectedLayout>
  )
}

// Article Row Component
interface ArticleRowProps {
  article: NewsletterArticle
  onUpdateCategory: (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => void
  pendingChange?: PendingChange
  onUpdateRationale: (articleId: string, rationale: string) => void
}

function ArticleRow({ article, onUpdateCategory, pendingChange, onUpdateRationale }: ArticleRowProps) {
  const getPriorityColor = (newsCategory?: NewsCategory) => {
    switch (newsCategory) {
      case 'Top Story Candidate': return 'text-red-600 font-semibold'
      case 'Solid News': return 'text-blue-600 font-medium'
      case 'Interesting but Lower Priority': return 'text-green-600'
      case 'Likely Noise or Opinion': return 'text-orange-600'
      default: return 'text-gray-500'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCurrentNewsCategory = () => {
    return pendingChange?.newNewsCategory || article.categorization.categories.news || ''
  }

  const getCurrentTechCategory = () => {
    return pendingChange?.newTechCategory || article.categorization.categories.tech || ''
  }

  const hasChanges = pendingChange && (
    pendingChange.newNewsCategory !== pendingChange.originalNewsCategory ||
    pendingChange.newTechCategory !== pendingChange.originalTechCategory
  )

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      hasChanges ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Article Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1">
            <a 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 hover:underline"
            >
              {article.title}
            </a>
          </h3>
          <div className="text-sm text-gray-600 mb-2">
            {article.sourceName} • {formatDate(article.publishedDate)}
          </div>
          {article.metaDescription && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {article.metaDescription}
            </p>
          )}
        </div>

        {/* Category Dropdowns */}
        <div className="flex gap-3 flex-shrink-0">
          {/* News Category */}
          <div>
            <select
              value={getCurrentNewsCategory()}
              onChange={(e) => onUpdateCategory(article._id, 'news', e.target.value)}
              className={`text-xs px-2 py-1 border rounded ${getPriorityColor(getCurrentNewsCategory() as NewsCategory)} ${
                hasChanges ? 'border-yellow-400' : ''
              }`}
            >
              {NEWS_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tech Category */}
          <div>
            <select
              value={getCurrentTechCategory()}
              onChange={(e) => onUpdateCategory(article._id, 'tech', e.target.value)}
              className={`text-xs px-2 py-1 border rounded text-purple-600 ${
                hasChanges ? 'border-yellow-400' : ''
              }`}
            >
              {TECH_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rationale Input - Show when there are pending changes */}
      {hasChanges && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rationale for changes:
          </label>
          <textarea
            value={pendingChange?.rationale || ''}
            onChange={(e) => onUpdateRationale(article._id, e.target.value)}
            placeholder="Please explain why you're changing the categorization..."
            className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
            rows={2}
          />
          {(!pendingChange?.rationale || !pendingChange.rationale.trim()) && (
            <div className="text-xs text-red-600 mt-1">
              Rationale is required for all changes
            </div>
          )}
        </div>
      )}
    </div>
  )
}
