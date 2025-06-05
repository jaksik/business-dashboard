// Article data structure for processors
export interface ParsedArticle {
  title: string
  link: string
  publishedDate?: Date
  metaDescription?: string
  guid?: string
}

// RSS-specific result type
export interface RSSFetchResult {
  success: boolean
  articles: ParsedArticle[]
  feedTitle?: string
  feedDescription?: string
  totalItems: number          // Total articles found in RSS feed
  totalProcessed?: number     // Articles actually processed (after applying limit)
  error?: string
}

// Article saving result type  
export interface SaveResult {
  totalArticles: number       // Number of articles passed to saver
  savedArticles: number       // Articles that would be saved (new articles)
  skippedDuplicates: number   // Articles skipped because they already exist
  errors: string[]
}

export interface FetchResult {
  sourceId: string
  sourceName: string
  success: boolean
  articlesFound: number        // Total articles found in RSS feed
  articlesProcessed?: number   // Articles actually processed (after applying limit)
  articlesSaved: number        // Articles that would be saved (new articles)
  skippedDuplicates?: number   // Articles skipped because they already exist
  error?: string
  duration: number
}

export interface FetchJobResult {
  jobId: string
  startTime: Date
  endTime: Date
  totalSources: number
  successfulSources: number
  failedSources: number
  totalArticlesFound: number
  totalArticlesSaved: number
  duration: number
  results: FetchResult[]
}
