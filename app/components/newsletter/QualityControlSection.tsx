import type { NewsletterData, PendingChanges } from './types'
import { ArticleRow } from './ArticleRow'

interface QualityControlSectionProps {
  articleData: NewsletterData
  onUpdateCategory: (articleId: string, categoryType: 'news' | 'tech', newCategory: string) => void
  pendingChanges: PendingChanges
  onUpdateRationale: (articleId: string, rationale: string) => void
}

export function QualityControlSection({
  articleData,
  onUpdateCategory,
  pendingChanges,
  onUpdateRationale
}: QualityControlSectionProps) {
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
                onUpdateCategory={onUpdateCategory}
                pendingChange={pendingChanges[article._id]}
                onUpdateRationale={onUpdateRationale}
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
                onUpdateCategory={onUpdateCategory}
                pendingChange={pendingChanges[article._id]}
                onUpdateRationale={onUpdateRationale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
