export interface Article {
  _id: string
  title: string
  link: string
  sourceName: string
  publishedDate?: string
  metaDescription?: string
  guid?: string
  fetchedAt: string
  categorization: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    categories?: {
      news?: string
      tech?: string
    }
    rationale?: string
    categorizedAt?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ArticleFilters {
  search: string
  source: string
  category: string
  status: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  limit: number
  page: number
}

export interface ArticleResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    sources: string[]
    categories: string[]
  }
}

export interface FilterOptions {
  sources: string[]
  categories: string[]
}
