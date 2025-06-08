// Single source of truth for all categorization categories

export const NEWS_CATEGORIES = [
  'Top Story Candidate',
  'Solid News', 
  'Interesting but Lower Priority',
  'Not Relevant'
] as const

export const TECH_CATEGORIES = [
  'Products and Updates',
  'Developer Tools',
  'Research and Innovation', 
  'Industry Trends',
  'Startups and Funding',
  'Not Relevant'
] as const

// TypeScript types derived from the constants
export type NewsCategory = typeof NEWS_CATEGORIES[number]
export type TechCategory = typeof TECH_CATEGORIES[number]

// Category criteria documentation (for reference)
export const NEWS_CATEGORY_CRITERIA = {
  'Top Story Candidate': {
    nature: 'Major, impactful news. High signal, low noise.',
    keywords: ['New model released', 'launches', 'unveils', 'breakthrough', 'major partnership', 'acquires', 'significant funding ($50M+)', 'new GPU/hardware', 'foundational model', 'open source'],
    content: 'Announcements of new AI products, services, significant model versions, major research papers with clear breakthroughs, or high-impact business news.'
  },
  'Solid News': {
    nature: 'Important and factual updates, but perhaps not groundbreaking enough for a top headline.',
    keywords: ['Updates', 'enhances', 'new feature', 'integrates', 'expands', 'study shows', 'report finds', 'secures funding'],
    content: 'Significant updates to existing AI tools/platforms, new noteworthy features, interesting case studies with concrete results, well-supported industry reports.'
  },
  'Interesting but Lower Priority': {
    nature: 'Potentially interesting but more niche or less broadly impactful.',
    keywords: ['Tips for', 'explores', 'discusses', 'community project', 'vision pieces', 'conceptual discussions'],
    content: 'Niche tool releases, specific tutorials, community news, smaller research findings, thoughtful perspectives, platform insights.'
  },
  'Not Relevant': {
    nature: 'Content that is not direct news, is overly speculative/opinion-based, or not related to artificial intelligence.',
    keywords: ['Opinion:', 'Perspective:', 'How to survive', 'The future of X is Y (speculative)', 'Is AI X?', 'Why I think Y', 'event announcements', 'tips collections', 'the best' ],
    content: 'Opinion pieces, guest posts, highly speculative articles, basic explainers, marketing content, fear-mongering, generic "AI trend" pieces, event promotion, product lists.'
  }
} as const

export const TECH_CATEGORY_CRITERIA = {
  'Products and Updates': 'New AI products, major feature releases, significant model launches, hardware announcements',
  'Developer Tools': 'APIs, frameworks, coding tools, SDKs, development platforms, technical utilities',
  'Research and Innovation': 'Research papers, academic breakthroughs, novel techniques, experimental findings, scientific studies',
  'Industry Trends': 'Market analysis, business trends, adoption studies, industry reports, strategic insights, company shifts',
  'Startups and Funding': 'Investment news, startup announcements, funding rounds, acquisitions, business developments',
  'Not Relevant': 'Non-tech content, general news, opinion pieces without technical substance, promotional material'
} as const

// Helper functions for working with categories
export const getAllNewsCategories = () => [...NEWS_CATEGORIES]
export const getAllTechCategories = () => [...TECH_CATEGORIES]

export const isValidNewsCategory = (category: string): category is NewsCategory => {
  return NEWS_CATEGORIES.includes(category as NewsCategory)
}

export const isValidTechCategory = (category: string): category is TechCategory => {
  return TECH_CATEGORIES.includes(category as TechCategory)
}

// Create default distribution objects
export const createEmptyNewsCategoryDistribution = () => 
  Object.fromEntries(NEWS_CATEGORIES.map(cat => [cat, 0])) as Record<NewsCategory, number>

export const createEmptyTechCategoryDistribution = () => 
  Object.fromEntries(TECH_CATEGORIES.map(cat => [cat, 0])) as Record<TechCategory, number>