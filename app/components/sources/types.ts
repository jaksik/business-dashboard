export interface Source {
  _id: string
  name: string
  url: string
  type: 'rss' | 'html'
  isActive: boolean
  fetchStatus: {
    lastFetchedAt?: Date
    lastFetchStatus?: 'success' | 'error' | 'pending'
    lastFetchMessage?: string
    lastFetchError?: string
    lastFetchSavedArticles?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface NewSource {
  name: string
  url: string
  type: 'rss' | 'html'
  isActive: boolean
}

export interface SourceFormData {
  name: string
  url: string
  type: 'rss' | 'html'
  isActive: boolean
}

export interface TestConnectionResult {
  success: boolean
  message: string
  details?: {
    title?: string
    itemCount?: number
    lastUpdated?: string
  }
  error?: string
}
