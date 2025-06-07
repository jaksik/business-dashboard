import type { TechCategory, NewsCategory } from '../../../lib/constants/categories'
import type { NewsletterData, PendingChanges } from './types'
import { ArticleRow } from './ArticleRow'

interface TechSectionProps {
  techCategory: TechCategory
  articleData: NewsletterData
  onUpdateCategory: (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => void
  pendingChanges: PendingChanges
  onUpdateRationale: (articleId: string, rationale: string) => void
}

export function TechSection({ 
  techCategory, 
  articleData, 
  onUpdateCategory, 
  pendingChanges, 
  onUpdateRationale 
}: TechSectionProps) {
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
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        📁 {techCategory} ({sortedArticles.length})
      </h2>
      <div className="space-y-2">
        {sortedArticles.map((article) => (
          <ArticleRow 
            key={article._id} 
            article={article} 
            onUpdateCategory={onUpdateCategory}
            pendingChange={pendingChanges[article._id]}
            onUpdateRationale={onUpdateRationale}
          />
        ))}
      </div>
    </div>
  )
}
