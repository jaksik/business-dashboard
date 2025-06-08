import { NEWS_CATEGORIES, TECH_CATEGORIES } from '../../../lib/constants/categories'
import type { NewsCategory } from '../../../lib/constants/categories'
import type { NewsletterArticle, PendingChange } from './types'

interface ArticleRowProps {
  article: NewsletterArticle
  onUpdateCategory: (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => void
  pendingChange?: PendingChange
  onUpdateRationale: (articleId: string, rationale: string) => void
}

export function ArticleRow({ article, onUpdateCategory, pendingChange, onUpdateRationale }: ArticleRowProps) {
  const getPriorityColor = (newsCategory?: NewsCategory) => {
    switch (newsCategory) {
      case 'Top Story Candidate': return 'text-red-600 font-semibold'
      case 'Solid News': return 'text-blue-600 font-medium'
      case 'Interesting but Lower Priority': return 'text-green-600'
      case 'Not Relevant': return 'text-orange-600'
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
