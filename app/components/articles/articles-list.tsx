'use client'

import { Article } from './types'

interface ArticlesListProps {
    articles: Article[]
    loading: boolean
    onArticleDeleted?: (articleId: string) => void
    selectedArticles?: Set<string>
    onArticleSelect?: (articleId: string) => void
}

export function ArticlesList({ articles, loading, onArticleDeleted, selectedArticles = new Set(), onArticleSelect }: ArticlesListProps) {
    const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error(`Failed to delete article: ${articleTitle}`)
            }

            // Notify parent component about the deletion
            onArticleDeleted?.(articleId)
        } catch (error) {
            console.error(`Error deleting article "${articleTitle}":`, error)
            alert(`Failed to delete article "${articleTitle}". Please try again.`)
        }
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Not available'
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium"

        switch (status) {
            case 'completed':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'processing':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'failed':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'pending':
            default:
                return `${baseClasses} bg-yellow-100 text-yellow-800`
        }
    }

    const truncateText = (text: string | undefined, maxLength: number) => {
        if (!text) return ''
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const getCategories = (article: Article) => {
        const categories = []
        if (article.categorization?.categories?.news) {
            categories.push(article.categorization.categories.news)
        }
        if (article.categorization?.categories?.tech) {
            categories.push(article.categorization.categories.tech)
        }
        return categories
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading articles...</span>
                </div>
            </div>
        )
    }

    if (articles.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-4">📰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p>Try adjusting your filters or check back later for new articles.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
                const categories = getCategories(article)

                return (
                    <div key={article._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-6">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-blue-600 text-sm">📰 {article.sourceName}</span>
                                </div>
                                <span className={getStatusBadge(article.categorization.status)}>
                                    {article.categorization.status.charAt(0).toUpperCase() + article.categorization.status.slice(1)}
                                </span>
                            </div>

                            {/* Article Title */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-3 leading-tight">
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {article.title}
                                </a>
                            </h3>

                            {/* Meta Description */}
                            {article.metaDescription && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                    {truncateText(article.metaDescription, 150)}
                                </p>
                            )}

                            {/* Categories */}
                            <div className="mb-4">
                                {categories.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {categories.map((category, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                ) : article.categorization.status === 'pending' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                            Uncategorized
                                        </span>
                                    </div>
                                ) : article.categorization.status === 'failed' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">🏷️</span>
                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                            Failed to categorize
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Dates */}


                            {/* Delete Button and Selection Checkbox - Positioned in bottom right */}
                            <div className="flex justify-between items-end mt-auto pt-2">
                                <div className="text-xs text-gray-500 space-y-1">
                                    <div>Published: {formatDate(article.publishedDate)}</div>
                                    <div>Fetched: {formatDate(article.fetchedAt)}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Selection Checkbox */}
                                    {onArticleSelect && (
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedArticles.has(article._id)}
                                                onChange={() => onArticleSelect(article._id)}
                                                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                                            />
                                            <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">
                                                Select
                                            </span>
                                        </label>
                                    )}
                                    {/* Delete Button */}
                                    <button
                                        onClick={async () => {
                                            const confirmed = window.confirm(`Are you sure you want to delete "${truncateText(article.title, 50)}"?`)
                                            if (confirmed) {
                                                await handleDeleteArticle(article._id, article.title)
                                            }
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-md transition-colors text-xs font-medium"
                                        title="Delete article"
                                    >
                                        🗑️
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
