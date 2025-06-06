import * as cheerio from 'cheerio'
import type { ParsedArticle, HTMLFetchResult } from '@/lib/jobs/article-fetch/types'
import { getSiteConfig, type HTMLSiteConfig } from '../config/html-sites'

// Minimal interface for what the HTML processor needs
interface HTMLSource {
  name: string
  url: string
}

export async function fetchHTMLFeed(source: HTMLSource, jobId: string, maxArticles: number): Promise<HTMLFetchResult> {
  console.log(`🌐 [${jobId}] HTML Processor: ${source.name} - limit: ${maxArticles}`)
  
  try {
    // Get site-specific configuration
    const config = getSiteConfig(source.url)
    if (!config) {
      throw new Error(`No HTML configuration found for ${new URL(source.url).hostname}. Please add configuration to html-sites.ts`)
    }
    
    console.log(`⚙️ [${jobId}] Using config for: ${config.domain}`)
    
    // Fetch the webpage
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Article Fetcher Bot)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Remove script and style tags for cleaner extraction
    $('script, style').remove()
    
    // Extract articles using configuration
    const articles: ParsedArticle[] = []
    const seenTitles = new Set<string>()
    const containers = $(config.containerSelector)
    
    console.log(`📦 [${jobId}] Found ${containers.length} article containers using "${config.containerSelector}"`)
    
    // Apply article limit - process only the first N containers
    const containersToProcess = containers.slice(0, maxArticles)
    console.log(`✂️ [${jobId}] ${source.name}: Processing ${containersToProcess.length} of ${containers.length} containers (limit: ${maxArticles})`)
    
    containersToProcess.each((index: number, container) => {
      try {
        const $container = $(container)
        
        // Extract article data using site-specific selectors - pass jobId
        const articleData = extractArticleData($container, config, $, source.url, jobId)
        
        // Validate and filter article
        if (isValidArticle(articleData, config, seenTitles)) {
          seenTitles.add(articleData.title)
          
          const article: ParsedArticle = {
            title: articleData.title,
            link: articleData.link,
            publishedDate: articleData.publishedDate,
            metaDescription: articleData.description || undefined,
            guid: articleData.link // Use link as GUID for HTML articles
          }
          
          articles.push(article)
          console.log(`📄 [${jobId}] Extracted: "${article.title.substring(0, 50)}..."`)
        }
      } catch (error) {
        console.error(`❌ [${jobId}] Error extracting article ${index}:`, error)
      }
    })
    
    console.log(`✅ [${jobId}] HTML scraping completed: ${articles.length} articles extracted`)
    
    return {
      success: true,
      articles,
      feedTitle: $('title').text() || source.name,
      feedDescription: $('meta[name="description"]').attr('content') || '',
      totalItems: containers.length
    }
    
  } catch (error) {
    console.error(`❌ [${jobId}] HTML fetch failed for ${source.name}:`, error)
    
    return {
      success: false,
      articles: [],
      totalItems: 0,
      error: error instanceof Error ? error.message : 'Unknown HTML scraping error'
    }
  }
}

/**
 * Extract article data from a container using site-specific configuration
 */
function extractArticleData(
  $container: cheerio.Cheerio<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  config: HTMLSiteConfig, 
  $: cheerio.CheerioAPI,
  sourceUrl: string,
  jobId: string // Add jobId parameter
) {
  // Extract title
  let title = ''
  if (config.titleSelector) {
    title = $container.find(config.titleSelector).first().text().trim()
  } else {
    // Extract from container text (common for card-based layouts like Anthropic)
    title = $container.text().trim()
  }

  // Extract date first (we'll use this to clean the title)
  let publishedDate: Date | undefined
  if (config.dateSelector) {
    const dateElement = $container.find(config.dateSelector).first()
    const datetime = dateElement.attr('datetime') // Try datetime attribute first
    const dateText = datetime || dateElement.text().trim() // Fallback to visible text
    
    // Debug logging to see what we're getting - now jobId is available
    console.log(`🐛 [${jobId}] Date debug - datetime attr: "${datetime}", visible text: "${dateElement.text().trim()}"`)
    
    if (dateText) {
      // Parse the date (datetime attribute is usually in ISO format, no need to add time)
      const parsed = datetime ? new Date(datetime) : new Date(dateText + ' 12:00:00')
      if (!isNaN(parsed.getTime())) {
        publishedDate = parsed
      }
    }
  }

  // Clean title by removing the date if it appears at the end
  if (publishedDate && config.dateSelector) {
    const visibleDateText = $container.find(config.dateSelector).first().text().trim()
    if (visibleDateText && title.includes(visibleDateText)) {
      // Remove the visible date text from the title (not the datetime attribute)
      title = title.replace(visibleDateText, '').trim()
    }
  }

  // Remove common prefixes like "Announcements", "Featured", etc.
  title = title.replace(/^(Announcements|Featured|Research|Blog|Policy|Product)\s*/, '')

  // Extract link
  let link = ''
  if (config.linkSelector) {
    link = $container.find(config.linkSelector).first().attr('href') || ''
  } else {
    // Check if container itself is a link, or find first link inside
    link = $container.attr('href') || $container.find('a').first().attr('href') || ''
  }

  // Fix URL construction - get base domain only
  if (link && link.startsWith('/')) {
    const url = new URL(sourceUrl)
    const baseUrl = `${url.protocol}//${url.hostname}` // Just protocol + hostname, no path
    link = baseUrl + link
  }

  // Extract description
  const description = config.descriptionSelector
    ? $container.find(config.descriptionSelector).first().text().trim()
    : ''

  return {
    title: title.trim(),
    description,
    publishedDate,
    link
  }
}

/**
 * Validate article data against configuration filters
 */
function isValidArticle(
  articleData: { title: string; description?: string; publishedDate?: Date; link?: string },
  config: HTMLSiteConfig,
  seenTitles: Set<string>
): boolean {
  const { title, link } = articleData
  
  // Must have title and link
  if (!title || !link) {
    return false
  }
  
  // Check title length
  if (title.length < config.filters.minTitleLength || 
      title.length > config.filters.maxTitleLength) {
    return false
  }
  
  // Check for excluded titles
  if (config.filters.excludeTitles.some(excluded => 
      title.toLowerCase().includes(excluded.toLowerCase()))) {
    return false
  }
  
  // Check for duplicates
  if (seenTitles.has(title)) {
    return false
  }
  
  return true
}
