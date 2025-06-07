import type { NewsCategory, TechCategory } from '../../../lib/constants/categories'

export interface NewsletterArticle {
  _id: string
  title: string
  link: string
  sourceName: string
  publishedDate?: Date
  metaDescription?: string
  categorization: {
    categories: {
      news?: NewsCategory
      tech?: TechCategory
    }
    confidence?: number
  }
}

export interface NewsletterData {
  [key: string]: NewsletterArticle[]
}

export interface PendingChange {
  articleId: string
  originalNewsCategory?: NewsCategory
  originalTechCategory?: TechCategory
  newNewsCategory?: NewsCategory
  newTechCategory?: TechCategory
  rationale: string
}

export interface PendingChanges {
  [articleId: string]: PendingChange
}
