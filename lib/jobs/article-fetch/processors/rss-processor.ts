import Parser from 'rss-parser'
import type { ISource } from '@/models'
import type { ParsedArticle, RSSFetchResult } from '@/lib/types/jobs/article-fetch'

// Simple RSS parser - only extracts basic fields
const parser = new Parser()

// Global configuration constants
const DEFAULT_MAX_ARTICLES = 10 // Global default (should match main index.ts)
const FAILSAFE_MAX_ARTICLES = 50 // Failsafe maximum (should match main index.ts)

/**
 * Calculate the effective max articles limit with failsafe protection
 * @param userInput - User provided limit (optional)
 * @returns Safe article limit that doesn't exceed failsafe
 */
function calculateMaxArticles(userInput?: number): number {
  // If no user input, use default
  if (!userInput || userInput <= 0) {
    return DEFAULT_MAX_ARTICLES
  }
  
  // Apply failsafe limit - never allow more than the maximum
  return Math.min(userInput, FAILSAFE_MAX_ARTICLES)
}

export async function fetchRSSFeed(source: ISource, jobId: string, userMaxArticles?: number): Promise<RSSFetchResult> {
  const maxArticles = calculateMaxArticles(userMaxArticles)
  console.log(`🔗 [${jobId}] RSS Processor: ${source.name} - limit: ${maxArticles} (requested: ${userMaxArticles || 'default'})`)
  
  try {
    const feed = await parser.parseURL(source.url)
    const totalItems = feed.items?.length || 0
    
    if (!feed.items || feed.items.length === 0) {
      return {
        success: true,
        articles: [],
        feedTitle: feed.title,
        feedDescription: feed.description,
        totalItems: 0
      }
    }

    // Apply article limit - take only the first N articles (newest first in RSS)
    const itemsToProcess = feed.items.slice(0, maxArticles)
    console.log(`✂️ [${jobId}] ${source.name}: Processing ${itemsToProcess.length} of ${totalItems} articles (limit: ${maxArticles})`)

    const articles: ParsedArticle[] = []
    
    for (const item of itemsToProcess) {
      // Skip items without required fields
      if (!item.title || !item.link) {
        console.log(`⚠️ [${jobId}] Skipping RSS item without title or link`)
        continue
      }

      const article: ParsedArticle = {
        title: item.title,
        link: item.link,
        publishedDate: item.pubDate ? new Date(item.pubDate) : undefined,
        metaDescription: item.contentSnippet || '',
        guid: item.guid || undefined
      }

      articles.push(article)
    }
        
    return {
      success: true,
      articles,
      feedTitle: feed.title,
      feedDescription: feed.description,
      totalItems: totalItems
    }

  } catch (error) {
    console.error(`❌ [${jobId}] RSS fetch failed for ${source.name}:`, error)
    
    return {
      success: false,
      articles: [],
      totalItems: 0,
      error: error instanceof Error ? error.message : 'Unknown RSS parsing error'
    }
  }
}

/**
 * Test RSS feed connectivity and structure
 */
export async function testRSSFeed(url: string): Promise<{
  success: boolean
  feedTitle?: string
  itemCount?: number
  error?: string
}> {
  try {
    console.log(`🧪 Testing RSS feed: ${url}`)
    
    const feed = await parser.parseURL(url)
    
    return {
      success: true,
      feedTitle: feed.title,
      itemCount: feed.items?.length || 0
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}