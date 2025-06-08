import React from 'react'
import { ArticleRow } from './ArticleRow'
import type { NewsletterData, PendingChanges } from './types'
import { NEWS_CATEGORIES } from '../../../lib/constants/categories'

interface TechSectionProps {
  techCategory: string
  articleData: NewsletterData
  pendingChanges: PendingChanges
  onUpdateCategory: (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => void
  onUpdateRationale: (articleId: string, rationale: string) => void
}

export function TechSection({ 
  techCategory, 
  articleData, 
  pendingChanges, 
  onUpdateCategory, 
  onUpdateRationale 
}: TechSectionProps) {
  const articles = articleData[techCategory] || []
  const relevantArticles = articles.filter(article => 
    article.categorization.categories.news !== 'Not Relevant'
  )

  if (relevantArticles.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {techCategory} ({relevantArticles.length})
      </h2>
      
      <div className="space-y-2">
        {relevantArticles
          .sort((a, b) => {
            const newsOrder = NEWS_CATEGORIES.indexOf(a.categorization.categories.news || 'Not Relevant')
            const techOrder = NEWS_CATEGORIES.indexOf(b.categorization.categories.news || 'Not Relevant')
            return newsOrder - techOrder
          })
          .map(article => (
            <ArticleRow
              key={article._id}
              article={article}
              pendingChange={pendingChanges[article._id]}
              onUpdateCategory={onUpdateCategory}
              onUpdateRationale={onUpdateRationale}
            />
          ))}
      </div>
    </div>
  )
}
