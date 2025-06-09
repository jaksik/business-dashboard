import React from 'react'
import { ArticleRow } from './article-row'
import type { NewsletterData, PendingChanges, NewsletterArticle } from './types'
import { NEWS_CATEGORIES } from '../../../lib/constants/categories'

interface NewsLetterSectionsProps {
  techCategory: string
  articleData: NewsletterData
  pendingChanges: PendingChanges
  onUpdateCategory: (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => void
  onUpdateRationale: (articleId: string, rationale: string) => void
}

export function NewsLetterSections({ 
  techCategory, 
  articleData, 
  pendingChanges, 
  onUpdateCategory, 
  onUpdateRationale 
}: NewsLetterSectionsProps) {
  let articlesToShow: NewsletterArticle[] = []

  if (techCategory === 'Not Relevant') {
    // For "Not Relevant" section, collect articles from ALL categories that are marked as "Not Relevant" in either news or tech
    articlesToShow = Object.values(articleData)
      .flat()
      .filter(article => 
        article.categorization.categories.news === 'Not Relevant' || 
        article.categorization.categories.tech === 'Not Relevant'
      )
  } else {
    // For regular tech categories, show articles in this category that are NOT marked as "Not Relevant" in news
    const articles = articleData[techCategory] || []
    articlesToShow = articles.filter(article => 
      article.categorization.categories.news !== 'Not Relevant'
    )
  }

  if (articlesToShow.length === 0) return null

  return (
    <div className="bg-white">
      <h3 className="text-xl font-bold underline mb-4 text-gray-800">
        {techCategory} ({articlesToShow.length})
      </h3>
      
      <div className="space-y-3">
        {articlesToShow
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