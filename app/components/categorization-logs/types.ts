export interface CategorizationLog {
  _id: string
  startTime: string
  endTime?: string
  status: 'in-progress' | 'completed' | 'completed_with_errors' | 'failed'
  processingTimeMs?: number
  triggeredBy: 'manual' | 'scheduled' | 'api'
  totalArticlesAttempted: number
  totalArticlesSuccessful: number
  totalArticlesFailed: number
  openaiUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCostUSD: number
    modelUsed: string
  }
  openaiModel: string
  processingErrors?: string[]
}

// NEW: Add the DetailedCategorizationLog type
export interface DetailedCategorizationLog extends CategorizationLog {
  articleResults: ArticleResult[]
  newsCategoryDistribution: Record<string, number>
  techCategoryDistribution: Record<string, number>
}

export interface ArticleResult {
  articleId: string
  title: string
  newsCategory: string
  techCategory: string
  rationale: string
  confidence: number
  status: 'success' | 'failed'
  errorMessage?: string
  processingTimeMs?: number
}

export interface LogsListProps {
  initialLogs: CategorizationLog[]
  initialPagination: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Renamed from LogFilters - parameters for the API call
export interface CategorizationLogApiParams {
  status?: string
  triggeredBy?: string
  days?: number // Represents "last N days"
  page: number
  limit: number
}

// New interface for UI-managed filter values
export interface CategorizationLogUiFilters {
  status?: string
  triggeredBy?: string
  days?: number // User input for "last N days"
}

export interface AnalyticsSummary {
  totalRuns: number
  completedRuns: number
  successRate: number
  totalCost: number
  totalTokens: number
  totalArticlesProcessed: number
  avgProcessingTimeMs: number
}

export interface DailyTrend {
  _id: string // date string
  count: number
  successfulArticles: number
  failedArticles: number
}

export interface CategoryDistributions {
  newsCategories: Record<string, number>[]
  techCategories: Record<string, number>[]
}

// NEW: Add the AnalyticsData interface that combines all analytics
export interface AnalyticsData {
  summary: AnalyticsSummary
  dailyTrends: DailyTrend[]
  categoryDistributions: CategoryDistributions
}
