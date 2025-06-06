// Types for fetch logs components
export interface FetchLog {
  _id: string
  jobId: string
  jobType: 'single' | 'bulk'
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'partial'
  totalSources: number
  sourceResults: SourceResult[]
  summary: LogSummary
  jobErrors: string[]
  createdAt: string
  updatedAt: string
}

export interface SourceResult {
  sourceId: string
  sourceName: string
  status: 'success' | 'failed'
  maxArticles?: number
  totalArticles: number
  savedArticles: number
  skippedDuplicates: number
  errors: string[]
  executionTime: number
}

export interface LogSummary {
  totalArticlesProcessed: number
  totalArticlesSaved: number
  totalDuplicatesSkipped: number
  totalErrors: number
  executionTime: number
}

export interface FetchLogsStats {
  totalJobs: number
  successfulJobs: number
  failedJobs: number
  totalArticlesSaved: number
  totalDuplicatesSkipped: number
  avgExecutionTime: number
}

export interface FetchLogsResponse {
  success: boolean
  data: {
    logs: FetchLog[]
    stats: FetchLogsStats
  }
}

export interface FetchLogsFilters {
  status?: string
  jobType?: string
  limit: number
}
